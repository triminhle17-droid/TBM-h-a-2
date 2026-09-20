document.addEventListener("DOMContentLoaded", function () {
  // 1. Chặn thư viện PageFlip can thiệp khi nhấn chuột vào vùng chữ
  const preventPageFlipOnText = function (e) {
    const target = e.target;
    
    // Nếu nhấn chuột vào vùng nội dung chữ hoặc vệt highlight
    if (target.closest(".page-content") || target.classList.contains("custom-highlight")) {
      e.stopPropagation();
    }
  };

  // Đăng ký chặn sự kiện ở giai đoạn Capture (true)
  document.addEventListener("mousedown", preventPageFlipOnText, true);
  document.addEventListener("pointerdown", preventPageFlipOnText, true);
  document.addEventListener("touchstart", preventPageFlipOnText, true);

  // 2. Xử lý BÔI ĐEN VĂN BẢN (mouseup)
  document.addEventListener("mouseup", function (e) {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const selectedText = selection.toString().trim();
    if (selectedText.length > 0) {
      const range = selection.getRangeAt(0);
      
      // Kiểm tra xem đoạn chọn có nằm trong .page-content không
      const container = range.commonAncestorContainer;
      const parentEl = container.nodeType === 1 ? container : container.parentElement;
      
      if (parentEl && parentEl.closest(".page-content")) {
        highlightRange(range);
        selection.removeAllRanges(); // Bỏ vết bôi đen màu xanh mặc định
      }
    }
  });

  // 3. Xử lý HỦY HIGHLIGHT khi click vào vệt màu vàng
  document.addEventListener("click", function (e) {
    const target = e.target;
    if (target && target.classList.contains("custom-highlight")) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      removeHighlight(target);
    }
  }, true);

  // Hàm bọc thẻ highlight nâng cao: Tách từng TextNode, BỎ QUA thẻ <br>
  function highlightRange(range) {
    if (range.collapsed) return;

    // 1. Xóa bỏ các thẻ highlight cũ trùng lặp trong vùng chọn
    const ancestor = range.commonAncestorContainer.nodeType === 1 
      ? range.commonAncestorContainer 
      : range.commonAncestorContainer.parentElement;
    
    if (ancestor) {
      const allMarks = ancestor.querySelectorAll(".custom-highlight");
      allMarks.forEach(mark => {
        if (range.intersectsNode(mark)) {
          removeHighlight(mark);
        }
      });
    }

    // 2. Thu thập tất cả các TextNode nằm trong Range (Bỏ qua các thẻ HTML như <br>)
    const textNodes = [];
    const treeWalker = document.createTreeWalker(
      range.commonAncestorContainer,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function (node) {
          // Bỏ qua các chuỗi khoảng trắng rỗng hoặc ngắt dòng không có nội dung
          if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
          
          // Kiểm tra xem node có nằm trong vùng bôi đen range hay không
          const nodeRange = document.createRange();
          nodeRange.selectNodeContents(node);
          
          if (
            range.compareBoundaryPoints(Range.END_TO_START, nodeRange) < 0 &&
            range.compareBoundaryPoints(Range.START_TO_END, nodeRange) > 0
          ) {
            return NodeFilter.FILTER_ACCEPT;
          }
          return NodeFilter.FILTER_REJECT;
        }
      }
    );

    while (treeWalker.nextNode()) {
      textNodes.push(treeWalker.currentNode);
    }

    if (textNodes.length === 0) return;

    // 3. Duyệt qua từng TextNode để bọc thẻ mark riêng lẻ
    textNodes.forEach(node => {
      let startOffset = 0;
      let endOffset = node.nodeValue.length;

      if (node === range.startContainer) {
        startOffset = range.startOffset;
      }
      if (node === range.endContainer) {
        endOffset = range.endOffset;
      }

      if (startOffset < endOffset) {
        const subRange = document.createRange();
        subRange.setStart(node, startOffset);
        subRange.setEnd(node, endOffset);

        const mark = document.createElement("mark");
        mark.className = "custom-highlight";

        try {
          subRange.surroundContents(mark);
        } catch (e) {
          console.error("Lỗi tô highlight node:", e);
        }
      }
    });
  }

  // Hàm tháo thẻ mark hủy highlight
  function removeHighlight(element) {
    const parent = element.parentNode;
    if (!parent) return;
    
    while (element.firstChild) {
      parent.insertBefore(element.firstChild, element);
    }
    parent.removeChild(element);
    parent.normalize(); // Gộp các TextNode bị xé nhỏ lại làm một
  }
});