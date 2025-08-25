// Close the collapsible menu when a nav-link is clicked
document.querySelectorAll('.navbar-nav .nav-link').forEach(function (element) {
  element.addEventListener('click', function () {
    var navbarCollapse = document.getElementById('navbarNav');
    if (navbarCollapse.classList.contains('show')) {
      var bsCollapse = new bootstrap.Collapse(navbarCollapse);
      bsCollapse.hide();
    }
  });
});

const mainNav = document.getElementById('main-nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    mainNav.classList.add('navbar-scrolled');
  } else {
    mainNav.classList.remove('navbar-scrolled');
  }
});
