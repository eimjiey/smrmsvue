<template>
  <AdminNavbar>
    <!-- full green page like mockup -->
    <div :style="pageStyle">
      <!-- top text -->
      <h1 :style="pageTitleStyle">MISCONTRACK</h1>

      <!-- big rounded frame -->
      <div :style="frameOuterStyle">
        <div :style="frameInnerStyle">
          <section class="about-us" aria-labelledby="about-heading">
            <div class="container">
              <!-- HERO -->
              <header class="header">
                <div class="hero-badge">About the system</div>

                <h1 id="about-heading">MISCONTRACK: Student Misconduct Report Management System</h1>
                <p class="tagline">
                  "Providing a Smarter Approach and Secure Reporting You Can Rely On."
                </p>

                <div class="hero-meta">
                  <span class="pill">Secure & confidential</span>
                  <span class="pill">Admin-friendly workflows</span>
                  <span class="pill">Built for campuses</span>
                </div>
              </header>

              <!-- MAIN GRID -->
              <main class="main">
                <!-- Mission -->
                <div class="card mission">
                  <h2>Our Mission</h2>
                  <p>
                    To provide schools with a simple and secure way to report and manage student misconduct efficiently.
                  </p>
                  <ul>
                    <li>Confidential reporting for students and staff</li>
                    <li>Clear case workflows for administrators</li>
                    <li>Automated notifications and status tracking</li>
                  </ul>
                </div>

                <!-- Vision -->
                <div class="card vision">
                  <h2>Our Vision</h2>
                  <p>
                    A campus environment where cases are handled quickly, fairly, and consistently.
                  </p>
                </div>

                <!-- Features -->
                <div class="card features">
                  <h2>Key Features</h2>
                  <div class="features-grid">
                    <article class="feature-item">
                      <h3>Easy Reporting</h3>
                      <p>Simple forms with optional anonymity.</p>
                    </article>

                    <article class="feature-item">
                      <h3>Case Management</h3>
                      <p>Monitor every step of an investigation.</p>
                    </article>

                    <article class="feature-item">
                      <h3>Role-Based Access</h3>
                      <p>Permissions tailored to each user role.</p>
                    </article>

                    <article class="feature-item">
                      <h3>Audit & Reporting</h3>
                      <p>Generate reports to identify trends.</p>
                    </article>
                  </div>
                </div>

                <!-- Values (NO NUMBERS) -->
                <div class="card values">
                  <h2>Core Values</h2>
                  <ul class="values-list">
                    <li>
                      <strong>Fairness:</strong> Reports are reviewed impartially.
                    </li>
                    <li>
                      <strong>Privacy:</strong> Data is protected with restricted access.
                    </li>
                    <li>
                      <strong>Transparency:</strong> Users receive timely updates.
                    </li>
                    <li>
                      <strong>Responsiveness:</strong> Fast actions with clear escalation.
                    </li>
                  </ul>
                </div>

                <!-- Contact -->
                <div class="card contact">
                  <h2>Contact & Support</h2>
                  <p>
                    For assistance, contact the Office of Student Affairs:
                  </p>
                  <ul>
                    <li>Email: <a href="mailto:misconductadmin@gmail.com">misconductadmin@gmail.com</a></li>
                    <li>Phone: <a href="tel:+639922385305">(+63) 922 385 305</a></li>
                    <li>Office hours: Mon–Fri, 8:30 AM – 5:00 PM</li>
                  </ul>
                </div>

                <!-- Team -->
                <div class="card team">
                  <h2>The Team</h2>
                  <p>
                    Created by students as a project requirement to support safer and more efficient campus reporting.
                  </p>
                  <ul class="team-list">
                    <li><strong>Developer:</strong> Mark Justin F. Balisacan</li>
                    <li><strong>Developer:</strong> Allysa B. Reyes</li>
                  </ul>
                </div>
              </main>

              <!-- FOOTER -->
              <footer class="footer">
                <p>
                  &copy; <span>{{ year }}</span> MISCONTRACK. All rights reserved.
                </p>
              </footer>
            </div>
          </section>
        </div>
      </div>
    </div>
  </AdminNavbar>
</template>

<script setup>
import { ref } from 'vue';
import AdminNavbar from '@/pages/navbar/AdminNavbar.vue';

const year = ref(new Date().getFullYear());

const pageStyle = {
  maxWidth: '100%',
  minHeight: '100vh',
  margin: '0',
  padding: '20px 32px 30px 32px',
  background: '#74a765',
  boxSizing: 'border-box',
};

const pageTitleStyle = {
  fontSize: '1.3rem',
  fontWeight: '800',
  color: '#09321d',
  marginBottom: '8px',
};

const frameOuterStyle = {
  borderRadius: '24px',
  background: '#0c4924',
  padding: '10px',
};

const frameInnerStyle = {
  borderRadius: '20px',
  background: '#f5fff5',
  padding: '18px 22px 22px 22px',
  boxSizing: 'border-box',
};
</script>

<style scoped>
:root {
  --accent: #0b6b4f;
  --accent-soft: #e0f3ed;
  --muted: #6b7280;
  --card-bg: #ffffff;
}

.about-us {
  background: transparent;
  color: #0f172a;
  padding: 12px 4px 8px;
  font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue',
    Arial, sans-serif;
}

.container {
  max-width: 980px;
  margin: 0 auto;
}

/* HERO */
.header {
  text-align: center;
  margin-bottom: 24px;
  position: relative;
}

.hero-badge {
  display: inline-block;
  padding: 4px 14px;
  border-radius: 999px;
  background: rgba(11, 107, 79, 0.08);
  color: var(--accent);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 10px;
}

.header h1 {
  font-size: 1.4rem;
  margin: 0 0 6px 0;
  letter-spacing: 0.03em;
}

.tagline {
  color: var(--muted);
  margin: 0;
  max-width: 560px;
  margin-inline: auto;
  font-size: 0.9rem;
}

.hero-meta {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.pill {
  padding: 5px 14px;
  border-radius: 999px;
  background: #74a765;
  border: 1px solid rgba(15, 23, 42, 0.06);
  box-shadow: 0 4px 10px rgba(15, 23, 42, 0.06);
  font-size: 0.72rem;
  color: #0f172a;
}

/* GRID — same height */
.main {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  align-items: stretch;
}

/* CARDS */
.card {
  background: #ffffff;
  padding: 18px 18px 16px;
  border-radius: 16px;
  box-shadow: 0 10px 18px rgba(9, 16, 20, 0.06);
  border: 1px solid rgba(15, 23, 42, 0.04);
  position: relative;
  overflow: hidden;

  height: 100%;
  display: flex;
  flex-direction: column;
}

.card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top left, rgba(11, 107, 79, 0.08), transparent 55%);
  opacity: 0.75;
  pointer-events: none;
}

.card h2 {
  margin-top: 0;
  margin-bottom: 6px;
  font-size: 1.05rem;
  position: relative;
  z-index: 1;
}

/* Remove Dots */
.mission ul,
.contact ul,
.team-list,
.values-list {
  list-style: none;
  margin: 0;
  padding-left: 0;
}

.values-list li {
  margin-bottom: 8px;
}

.card p,
.card ul {
  position: relative;
  z-index: 1;
  font-size: 0.9rem;
}

/* Features grid */
.features-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 6px;
}

.feature-item {
  padding: 9px 10px;
  border-radius: 10px;
  background: linear-gradient(180deg, #ffffff, #f5faf8);
  border: 1px solid rgba(15, 23, 42, 0.05);
  box-shadow: 0 6px 12px rgba(15, 23, 42, 0.05);
}

.feature-item h3 {
  margin: 0 0 4px 0;
  font-size: 0.9rem;
  color: var(--accent);
}

.feature-item p {
  margin: 0;
  font-size: 0.82rem;
}

/* Team */
.team-list {
  margin-top: 8px;
}

/* Contact links */
.contact a {
  color: var(--accent);
  text-decoration: none;
}

.contact a:hover {
  text-decoration: underline;
}

/* Footer */
.footer {
  text-align: center;
  margin-top: 22px;
  color: var(--muted);
  font-size: 0.8rem;
}

/* Responsive */
@media (max-width: 760px) {
  .main {
    grid-template-columns: 1fr;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .header h1 {
    font-size: 1.2rem;
  }
}
</style>
