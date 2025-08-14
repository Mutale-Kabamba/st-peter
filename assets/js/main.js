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

  // Fetch and render announcements (first 3 events as announcements)
  if (document.getElementById('announcements-list')) {
    fetch('data/events.json')
      .then(res => res.json())
      .then(events => {
        const container = document.getElementById('announcements-list');
        if (!events.length) {
          container.innerHTML = '<li>No announcements at this time.</li>';
          return;
        }
        events.slice(0, 3).forEach(event => {
          const li = document.createElement('li');
          li.innerHTML = `<strong>${event.title}</strong>: ${event.description}`;
          container.appendChild(li);
        });
      })
      .catch(() => {
        document.getElementById('announcements-list').innerHTML = '<li>Unable to load announcements.</li>';
      });
  }

  // Fetch and render daily readings from readings.json with date selection

  // Sunday designations for 2025
  const sundayDesignations = {
    '2025-01-05': 'Epiphany of the Lord (Solemnity)',
    '2025-01-12': 'Baptism of the Lord (Feast)',
    '2025-01-19': '2nd Sunday in Ordinary Time',
    '2025-01-26': '3rd Sunday in Ordinary Time (Sunday of the Word of God)',
    '2025-02-02': 'Presentation of the Lord (Feast)',
    '2025-02-09': '5th Sunday in Ordinary Time',
    '2025-02-16': '6th Sunday in Ordinary Time',
    '2025-02-23': '7th Sunday in Ordinary Time',
    '2025-03-02': '8th Sunday in Ordinary Time',
    '2025-03-09': '1st Sunday of Lent',
    '2025-03-16': '2nd Sunday of Lent',
    '2025-03-23': '3rd Sunday of Lent',
    '2025-03-30': '4th Sunday of Lent (Laetare)',
    '2025-04-06': '5th Sunday of Lent',
    '2025-04-13': 'Palm Sunday of the Passion of the Lord',
    '2025-04-20': 'Easter Sunday of the Resurrection of the Lord',
    '2025-04-27': '2nd Sunday of Easter (Divine Mercy)',
    '2025-05-04': '3rd Sunday of Easter',
    '2025-05-11': '4th Sunday of Easter (Good Shepherd Sunday)',
    '2025-05-18': '5th Sunday of Easter',
    '2025-05-25': '6th Sunday of Easter',
    '2025-06-01': 'Ascension of the Lord (or 7th Sunday of Easter)',
    '2025-06-08': 'Pentecost Sunday (Solemnity)',
    '2025-06-15': 'Most Holy Trinity (Solemnity)',
    '2025-06-22': 'Most Holy Body and Blood of Christ (Corpus Christi) (Solemnity)',
    '2025-06-29': 'Saints Peter & Paul, Apostles (Solemnity)',
    '2025-07-06': '14th Sunday in Ordinary Time',
    '2025-07-13': '15th Sunday in Ordinary Time',
    '2025-07-20': '16th Sunday in Ordinary Time',
    '2025-07-27': '17th Sunday in Ordinary Time',
    '2025-08-03': '18th Sunday in Ordinary Time',
    '2025-08-10': '19th Sunday in Ordinary Time',
    '2025-08-17': '20th Sunday in Ordinary Time',
    '2025-08-24': '21st Sunday in Ordinary Time',
    '2025-08-31': '22nd Sunday in Ordinary Time',
    '2025-09-07': '23rd Sunday in Ordinary Time',
    '2025-09-14': 'Exaltation of the Holy Cross (Feast)',
    '2025-09-21': '25th Sunday in Ordinary Time',
    '2025-09-28': '26th Sunday in Ordinary Time',
    '2025-10-05': '27th Sunday in Ordinary Time',
    '2025-10-12': '28th Sunday in Ordinary Time',
    '2025-10-19': '29th Sunday in Ordinary Time',
    '2025-10-26': '30th Sunday in Ordinary Time',
    '2025-11-02': 'Commemoration of All the Faithful Departed (All Souls’ Day)',
    '2025-11-09': 'Dedication of the Lateran Basilica (Feast)',
    '2025-11-16': '33rd Sunday in Ordinary Time',
    '2025-11-23': 'Our Lord Jesus Christ, King of the Universe (Solemnity)',
    '2025-11-30': '1st Sunday of Advent',
    '2025-12-07': '2nd Sunday of Advent',
    '2025-12-14': '3rd Sunday of Advent (Gaudete)',
    '2025-12-21': '4th Sunday of Advent',
    '2025-12-28': 'The Holy Family of Jesus, Mary and Joseph (Feast)'
  };

  function formatDateTitle(dateStr) {
    const dateObj = new Date(dateStr);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = days[dateObj.getDay()];
    const day = String(dateObj.getDate()).padStart(2, '0');
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const month = monthNames[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    return `${day} ${month} ${year} - ${dayName}`;
  }

  function renderReadingsForDate(dateStr) {
    fetch('data/readings.json')
      .then(res => res.json())
      .then(allReadings => {
        const reading = allReadings.find(r => r.date === dateStr);
        const container = document.getElementById('readings-content');
        const readingsSection = document.querySelector('.readings-section h2');
        if (readingsSection) {
          // If Sunday and in mapping, show designation and make red
          if (sundayDesignations[dateStr]) {
            readingsSection.textContent = `Readings: ${sundayDesignations[dateStr]}`;
            readingsSection.style.color = 'red';
          } else {
            readingsSection.textContent = `Daily Readings (${formatDateTitle(dateStr)})`;
            readingsSection.style.color = '';
          }
        }
        if (!reading) {
          container.innerHTML = '<p>No readings available for this date.</p>';
          return;
        }
        container.innerHTML = `<h4>${reading.title || 'Daily Readings'}</h4>`;
        reading.readings.forEach(rdg => {
          const div = document.createElement('div');
          div.className = 'reading-card';
          div.innerHTML = `<strong>${rdg.label}</strong> <em>(${rdg.reference})</em>: <span>${rdg.text}</span>`;
          container.appendChild(div);
        });
      })
      .catch(() => {
        document.getElementById('readings-content').innerHTML = '<p>Unable to load daily readings.</p>';
      });
  }

  const readingsDateInput = document.getElementById('readings-date');
  if (readingsDateInput) {
    // Set default to today
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    readingsDateInput.value = dateStr;
    renderReadingsForDate(dateStr);
    readingsDateInput.addEventListener('change', function() {
      renderReadingsForDate(this.value);
    });
  }

  // Fetch and render upcoming events (all events)
  if (document.getElementById('events-list')) {
    fetch('data/events.json')
      .then(res => res.json())
      .then(events => {
        const container = document.getElementById('events-list');
        if (!events.length) {
          container.innerHTML = '<li>No upcoming events.</li>';
          return;
        }
        events.forEach(event => {
          const li = document.createElement('li');
          li.innerHTML = `<strong>${event.title}</strong> <span>(${event.date} @ ${event.location})</span><br>${event.description}`;
          container.appendChild(li);
        });
      })
      .catch(() => {
        document.getElementById('events-list').innerHTML = '<li>Unable to load events.</li>';
      });
  }
});