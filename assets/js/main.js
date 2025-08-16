
let bulletins = [];

function parseBulletinFilename(name) {
  // Example: homily-2025-08-01-Homily for the Transfiguration of the Lord.pdf
  // Main format: type-year-month-day(-Document Name).pdf
  const regex = /(homily|report|announcement|lesson)[-_](\d{4})[-_](\d{2})[-_](\d{2})(?:[-_](.+?))?\.pdf$/i;
  const match = name.match(regex);
  if (!match) {
    // If not matching, just show the filename as title and section as 'other'
    return { title: name.replace(/_/g, ' ').replace(/\.pdf$/i, ''), section: 'other', month: null, year: null };
  }
  const sectionMap = {
    homily: 'homilies',
    report: 'reports',
    announcement: 'announcements',
    lesson: 'lessons'
  };
  const section = sectionMap[match[1].toLowerCase()] || 'other';
  const year = parseInt(match[2]);
  const month = parseInt(match[3]);
  const day = parseInt(match[4]);
  let title = '';
  const formattedDate = `${day} ${getMonthName(month)} ${year}`;
  if (match[5]) {
    // Use the document name after the main format, plus the date
    title = `${match[5].replace(/_/g, ' ')} (${formattedDate})`;
  } else {
    // Fallback to formatted date
    title = `${match[1].charAt(0).toUpperCase() + match[1].slice(1)} - ${formattedDate}`;
  }
  return { title, section, month, year };
}

function getMonthName(m) {
  return ["January","February","March","April","May","June","July","August","September","October","November","December"][m-1];
}

function loadBulletins() {
  fetch('/api/bulletins')
    .then(res => res.json())
    .then(files => {
      bulletins = files.map(f => {
        const meta = parseBulletinFilename(f.name);
        return { ...meta, url: f.url };
      });
      filterBulletins();
    });
}

function filterBulletins() {
  const section = document.getElementById('bulletin-section').value;
  const month = document.getElementById('bulletin-month').value;
  const year = document.getElementById('bulletin-year').value;
  const results = document.getElementById('bulletin-results');
  let filtered = [];
  if (section === 'all' && month === 'all' && year === 'all') {
    // Show recent 2 from each section
    const sections = ['homilies', 'reports', 'announcements', 'lessons'];
    sections.forEach(sec => {
      let items = bulletins.filter(b => b.section === sec)
        .sort((a, b) => (b.year - a.year) || (b.month - a.month));
      filtered = filtered.concat(items.slice(0, 2));
    });
  } else {
    filtered = bulletins.filter(b => {
      return (section === 'all' || b.section === section)
        && (month === 'all' || b.month == month)
        && (year === 'all' || b.year == year);
    });
  }
  results.innerHTML = filtered.length ?
    '<ul class="bulletin-list">' + filtered.map(b => `<li><a href="${b.url}" target="_blank">${b.title}</a></li>`).join('') + '</ul>' :
    '<p class="no-bulletins">No bulletins found for selected filters.</p>';
}
// Bulletin page styles
const style = document.createElement('style');
style.innerHTML = `
  .main-content {
    max-width: 600px;
    margin: 2rem auto;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.07);
    padding: 2rem;
  }
  .bulletin-filters {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    align-items: center;
    margin-bottom: 1.5rem;
  }
  .bulletin-filters label {
    font-weight: 500;
    margin-right: 0.3rem;
  }
  .bulletin-filters select {
    padding: 0.3rem 0.7rem;
    border-radius: 6px;
    border: 1px solid #bbb;
    background: #f8f8f8;
    font-size: 1rem;
  }
  .bulletin-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .bulletin-list li {
    margin-bottom: 0.8rem;
    font-size: 1.08rem;
    padding: 0.5rem 0.7rem;
    border-radius: 6px;
    transition: background 0.2s;
  }
  .bulletin-list li:hover {
    background: #f0f4fa;
  }
  .bulletin-list a {
    color: #0a2a4d;
    text-decoration: underline;
    font-weight: 500;
  }
  .no-bulletins {
    color: #a00;
    font-style: italic;
    margin-top: 1rem;
  }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', () => {
  // ...existing code...
  if (document.getElementById('bulletin-section')) {
    document.getElementById('bulletin-section').addEventListener('change', filterBulletins);
    document.getElementById('bulletin-month').addEventListener('change', filterBulletins);
    document.getElementById('bulletin-year').addEventListener('change', filterBulletins);
    loadBulletins();
  }
});
// Dynamically load nav and footer HTML
function loadHTML(selector, url) {
  fetch(url)
    .then(response => response.text())
    .then(data => {
      document.querySelector(selector).innerHTML = data;
    });
}

document.addEventListener('DOMContentLoaded', () => {
  loadHTML('#nav-container', 'assets/html/nav.html');
  loadHTML('#footer-container', 'assets/html/footer.html');

  // Highlight active nav link after nav loads
  fetch('assets/html/nav.html')
    .then(() => {
      setTimeout(() => {
        const path = window.location.pathname.split('/').pop();
        if (path === 'index.html' || path === '') {
          document.getElementById('nav-home')?.classList.add('active');
        } else if (path === 'about.html') {
          document.getElementById('nav-about')?.classList.add('active');
        } else if (path === 'mass-times.html') {
          document.getElementById('nav-mass')?.classList.add('active');
        } else if (path === 'ministries.html') {
          document.getElementById('nav-ministries')?.classList.add('active');
        } else if (path === 'bulletin.html') {
          document.getElementById('nav-bulletin')?.classList.add('active');
        } else if (path === 'contact.html') {
          document.getElementById('nav-contact')?.classList.add('active');
        }
      }, 100);
    });
});
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
    fetch('data/readings_2025.json')
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