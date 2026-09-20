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
        highlightRange(range, selection);
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

  // Hàm bọc thẻ highlight: Sửa logic quét node để chạy mượt trên 1 dòng lẫn nhiều dòng
  function highlightRange(range, selection) {
    if (range.collapsed) return;

    // 1. Xóa các highlight cũ bị đè lên trong vùng chọn
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

    // 2. TRƯỜNG HỢP 1: Bôi đen ngắn nằm hoàn toàn TRONG 1 DÒNG (Cùng 1 TextNode)
    if (range.startContainer === range.endContainer && range.startContainer.nodeType === Node.TEXT_NODE) {
      const node = range.startContainer;
      if (range.startOffset < range.endOffset) {
        const subRange = document.createRange();
        subRange.setStart(node, range.startOffset);
        subRange.setEnd(node, range.endOffset);

        const mark = document.createElement("mark");
        mark.className = "custom-highlight";
        try {
          subRange.surroundContents(mark);
        } catch (e) {
          console.error("Lỗi tô 1 dòng:", e);
        }
      }
      return;
    }

    // 3. TRƯỜNG HỢP 2: Bôi đen DÀI QUA NHIỀU DÒNG / THẺ HTML (Quét qua TreeWalker)
    const textNodes = [];
    const treeWalker = document.createTreeWalker(
      range.commonAncestorContainer,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function (node) {
          if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
          
          // Kiểm tra xem node có nằm trong vùng bôi đen hay không
          if (selection.containsNode(node, true)) {
            return NodeFilter.FILTER_ACCEPT;
          }
          return NodeFilter.FILTER_REJECT;
        }
      }
    );

    while (treeWalker.nextNode()) {
      textNodes.push(treeWalker.currentNode);
    }

    // Duyệt bọc từng đoạn chữ
    textNodes.forEach(node => {
      let startOffset = (node === range.startContainer) ? range.startOffset : 0;
      let endOffset = (node === range.endContainer) ? range.endOffset : node.nodeValue.length;

      if (startOffset < endOffset) {
        const subRange = document.createRange();
        subRange.setStart(node, startOffset);
        subRange.setEnd(node, endOffset);

        const mark = document.createElement("mark");
        mark.className = "custom-highlight";
        try {
          subRange.surroundContents(mark);
        } catch (e) {
          console.error("Lỗi tô nhiều dòng:", e);
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
    parent.normalize();
  }
});