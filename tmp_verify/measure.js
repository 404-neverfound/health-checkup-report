// 通过 --run-js 定位 section，输出其偏移量
document.addEventListener('DOMContentLoaded', function() {
  var el = document.getElementById('sec-protection-effectiveness');
  if (el) {
    var r = el.getBoundingClientRect();
    console.log('SECTION_TOP=' + (window.scrollY + r.top));
    console.log('SECTION_HEIGHT=' + r.height);
  } else {
    console.log('SECTION_NOT_FOUND');
  }
});
