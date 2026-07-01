function toggleTheme(){
  const h=document.documentElement;
  h.dataset.theme = h.dataset.theme==='dark' ? 'light' : 'dark';
}
// respect system preference on first load
if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches){
  document.documentElement.dataset.theme='dark';
}
// robust in-page navigation (works inside embedded/preview iframes too)
document.querySelectorAll('a[href^="#"]').forEach(function(a){
  a.addEventListener('click', function(e){
    var href = this.getAttribute('href');
    if(href === '#') return;
    var target = (href === '#top') ? document.getElementById('top') : document.querySelector(href);
    if(target){
      e.preventDefault();
      var y = target.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    }
  });
});
