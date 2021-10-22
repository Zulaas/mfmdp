var items = document.getElementsByClassName('nav-link');
for (var i = 0; i < items.length; i++) {
  items[i].addEventListener('click', printDetails);
}

function printDetails(e) {
  for (var i = 0; i < items.length; i++) {
    if (items[i].classList.contains("active")) {
      items[i].classList.toggle("active")
    }
  }
  this.classList.add("active");
}

