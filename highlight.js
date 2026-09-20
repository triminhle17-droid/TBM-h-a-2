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

  // Hàm bọc thẻ highlight (Đã sửa lỗi mất chữ)
  function highlightRange(range) {
    if (range.collapsed) return;

    const container = range.commonAncestorContainer;
    const parentMark = container.nodeType === 1 ? container.closest(".custom-highlight") : container.parentElement.closest(".custom-highlight");
    
    if (parentMark && range.toString().trim() === parentMark.textContent.trim()) {
      return;
    }

    // Xóa bớt các thẻ highlight cũ lồng bên trong
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

    // Tạo highlight mới
    const mark = document.createElement("mark");
    mark.className = "custom-highlight";

    try {
      range.surroundContents(mark);
    } catch (err) {
      try {
        const extracted = range.extractContents();
        mark.appendChild(extracted);
        range.insertNode(mark);
      } catch (e) {
        console.error("Lỗi khi tô đè highlight:", e);
      }
    }
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