document.addEventListener('DOMContentLoaded', () => {
  // Hamburger menu logic
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      menuToggle.classList.toggle('active');
    });
  }

  // Fetch and render clergy on about.html
  if (document.getElementById('clergy-container')) {
    fetch('data/clergy.json')
      .then(res => res.json())
      .then(clergy => {
        const container = document.getElementById('clergy-container');
        clergy.forEach(member => {
          const card = document.createElement('div');
          card.className = 'clergy-card';
          card.innerHTML = `
            <img src="${member.photoUrl}" alt="${member.name}">
            <h3>${member.name}</h3>
            <p><strong>${member.title}</strong></p>
            <p>${member.bio}</p>
          `;
          container.appendChild(card);
        });
      })
      .catch(() => {
        document.getElementById('clergy-container').innerHTML = "<p>Unable to load clergy information.</p>";
      });
  }

  // Fetch and render ministries on ministries.html
  if (document.getElementById('ministries-list')) {
    fetch('data/ministries.json')
      .then(res => res.json())
      .then(ministries => {
        const container = document.getElementById('ministries-list');
        ministries.forEach(ministry => {
          const card = document.createElement('div');
          card.className = 'ministry-card';
          card.innerHTML = `
            <h3>${ministry.name}</h3>
            <p>${ministry.description}</p>
            <div class="contact">Contact: <a href="mailto:${ministry.contact}">${ministry.contact}</a></div>
          `;
          container.appendChild(card);
        });
      })
      .catch(() => {
        document.getElementById('ministries-list').innerHTML = "<p>Unable to load ministries information.</p>";
      });
  }

  // Fetch and render events on index.html
  if (document.getElementById('events-list')) {
    fetch('data/events.json')
      .then(res => res.json())
      .then(events => {
        const container = document.getElementById('events-list');
        if (events.length === 0) {
          container.innerHTML = "<p>No upcoming events.</p>";
          return;
        }
        events.forEach(event => {
          const card = document.createElement('div');
          card.className = 'event-card';
          card.innerHTML = `
            <h3>${event.title}</h3>
            <div class="event-date-location">${event.date} &mdash; ${event.location}</div>
            <p>${event.description}</p>
          `;
          container.appendChild(card);
        });
      })
      .catch(() => {
        document.getElementById('events-list').innerHTML = "<p>Unable to load events.</p>";
      });
  }
});