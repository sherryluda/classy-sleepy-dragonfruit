document.querySelectorAll(".CD-2").forEach((cd) => {
  cd.addEventListener("click", () => {
    const link = cd.getAttribute("data-link");
    if (link) {
      window.location.href = link;
    }
  });
});

let t = { value: 0 };
gsap.to(t, {
  value: Math.PI * 2,
  duration: 8,
  repeat: -1,
  ease: "linear",
  onUpdate: () => {
    const radius = 30;
    const x = radius * Math.sin(t.value);
    const y = radius * Math.sin(t.value) * Math.cos(t.value);

    gsap.set(".div", {
      x: x,
      y: y,
    });
  },
});

document.querySelectorAll('.CD-2').forEach(cd2 => {
  cd2.addEventListener('mouseenter', function() {
    const sound = document.getElementById('hover-sound');
    sound.currentTime = 0;
    sound.play();
  });
});

document.addEventListener('DOMContentLoaded', function() {
  const allCd2 = document.querySelectorAll('.CD-2');
  const otherDiv = document.querySelector('.div');

  allCd2.forEach(cd2 => {
    cd2.addEventListener('mouseenter', function() {
      otherDiv.style.filter = 'blur(3px)';
    });

    cd2.addEventListener('mouseleave', function() {
      otherDiv.style.filter = 'none';
    });
  });
});

