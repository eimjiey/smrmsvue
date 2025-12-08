<template>
  <AdminNavbar>
    <div :style="formWrapperOuterStyle">
      <div :style="formWrapperInnerStyle">
        <!-- Ribbon header, same style family as MISCONDUCT RECORD -->
        <div :style="sectionHeaderStyle">ABOUT SMRMS</div>

        <section class="about-us" aria-labelledby="about-heading">
          <div class="container">
            <!-- HERO -->
            <header class="header">
              <div class="hero-badge">About the system</div>

              <img src="/assets/logo.png" alt="SMRMS Logo" class="logo" />

              <h1 id="about-heading">Student Misconduct Report Management System</h1>
              <p class="tagline">
                A safer, fairer, and more transparent approach to handling student misconduct.
              </p>

              <div class="hero-meta">
                <span class="pill">Secure &amp; confidential</span>
                <span class="pill">Admin‑friendly workflows</span>
                <span class="pill">Built for campuses</span>
              </div>
            </header>

            <!-- MAIN GRID INSIDE THE SAME CARD -->
            <main class="main">
              <!-- Mission -->
              <div class="card mission">
                <h2>Our Mission</h2>
                <p>
                  To provide educational institutions with an intuitive platform that streamlines the
                  reporting, investigation, and resolution of student misconduct while protecting privacy,
                  ensuring due process, and improving communication between stakeholders.
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
                  A campus culture where incidents are handled quickly, fairly, and consistently —
                  enabling students and staff to focus on learning and growth.
                </p>
              </div>

              <!-- Features -->
              <div class="card features">
                <h2>Key Features</h2>
                <div class="features-grid">
                  <article class="feature-item">
                    <h3>Easy Reporting</h3>
                    <p>Simple forms with optional anonymity to encourage accurate and timely reports.</p>
                  </article>

                  <article class="feature-item">
                    <h3>Case Management</h3>
                    <p>Track every step of an investigation, from intake to final resolution.</p>
                  </article>

                  <article class="feature-item">
                    <h3>Role-Based Access</h3>
                    <p>Granular permissions for students, faculty, investigators, and committees.</p>
                  </article>

                  <article class="feature-item">
                    <h3>Audit &amp; Reporting</h3>
                    <p>Generate anonymized reports to spot trends and support policy updates.</p>
                  </article>
                </div>
              </div>

              <!-- Values -->
              <div class="card values">
                <h2>Core Values</h2>
                <ol>
                  <li><strong>Fairness:</strong> Every report is handled impartially and documented thoroughly.</li>
                  <li><strong>Privacy:</strong> Personal data is minimized and access is strictly controlled.</li>
                  <li><strong>Transparency:</strong> Parties receive appropriate, timely updates.</li>
                  <li><strong>Responsiveness:</strong> Clear SLAs, reminders, and escalation policies.</li>
                </ol>
              </div>

              <!-- Contact -->
              <div class="card contact">
                <h2>Contact &amp; Support</h2>
                <p>If you have questions or need help using the system, contact the Office of Student Affairs:</p>
                <ul>
                  <li>Email: <a href="misconductadmin@gmail.com">misconductadmin@gmail.com</a></li>
                  <li>Phone: <a href="tel:+639922385305">(+63) 922 385 305</a></li>
                  <li>Office hours: Mon–Fri, 8:30 AM – 5:00 PM</li>
                </ul>
              </div>

              <!-- Team -->
              <div class="card team">
                <h2>The Team</h2>
                <p>
                  Built by a multidisciplinary team of educators, developers, and student advocates focused on
                  responsible campus safety solutions.
                </p>
                <ul class="team-list">
                  <li><strong>Developer:</strong> Mark Justin F. Balisacan</li>
                  <li><strong>Developer:</strong> Allysa B. Reyes</li>
                </ul>
              </div>
            </main>

            <!-- FOOTER -->
            <footer class="footer">
              <p>&copy; <span>{{ year }}</span> Student Misconduct Report Management System. All rights reserved.</p>
            </footer>
          </div>
        </section>
      </div>
    </div>
  </AdminNavbar>
</template>

<script setup>
import { ref } from 'vue';
import AdminNavbar from '@/pages/navbar/AdminNavbar.vue';
import formBg from '@/assets/FORMBACKGROUND.jpg';

const year = ref(new Date().getFullYear());

const formWrapperOuterStyle = {
  maxWidth: '850px',
  margin: '20px auto 40px auto',
  padding: '0 10px',
};

const formWrapperInnerStyle = {
  padding: '20px',
  borderRadius: '24px',
  backgroundImage: `url(${formBg})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  boxShadow: '0 8px 16px rgba(0,0,0,0.25)',
  position: 'relative',
};

const sectionHeaderStyle = {
  position: 'absolute',
  top: '6px',
  left: '28px',
  padding: '6px 18px',
  background: '#ffffff',
  borderRadius: '999px',
  fontWeight: 'bold',
  fontSize: '0.9rem',
  zIndex: 2,
};
</script>

<style scoped>
:root {
  --accent: #0b6b4f;
  --accent-soft: #e0f3ed;
  --muted: #6b7280;
  --card-bg: #ffffff;
}

/* Now the “page” is the white card inside the green gradient,
   like the misconduct form container. */
.about-us {
  background: transparent;
  color: #0f172a;
  padding: 30px 16px 20px;
  font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.container {
  max-width: 980px;
  margin: 0 auto;
}

/* HERO */
.header {
  text-align: center;
  margin-bottom: 28px;
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

.logo {
  width: 78px;
  height: 78px;
  object-fit: contain;
  display: inline-block;
  margin-bottom: 10px;
}

.header h1 {
  font-size: 1.6rem;
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
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.06);
  box-shadow: 0 4px 10px rgba(15, 23, 42, 0.06);
  font-size: 0.72rem;
  color: #0f172a;
}

/* GRID INSIDE CARD, similar spacing to form rows */
.main {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  align-items: start;
}

/* CARDS - match soft white surfaces from form */
.card {
  background: var(--card-bg);
  padding: 18px 18px 16px;
  border-radius: 16px;
  box-shadow: 0 10px 18px rgba(9, 16, 20, 0.06);
  border: 1px solid rgba(15, 23, 42, 0.04);
  position: relative;
  overflow: hidden;
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

.card p,
.card ul,
.card ol {
  position: relative;
  z-index: 1;
  font-size: 0.9rem;
}

/* Mission / values lists */
.mission ul {
  margin: 8px 0 0 18px;
  padding-left: 0;
}

.values ol {
  margin: 8px 0 0 18px;
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
  list-style: none;
  padding: 0;
  margin: 8px 0 0 0;
}

.team-list li {
  margin-bottom: 6px;
  font-size: 0.86rem;
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
  .about-us {
    padding-top: 24px;
  }

  .main {
    grid-template-columns: 1fr;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .header h1 {
    font-size: 1.35rem;
  }
}

.about-us {
  min-height: 100vh;
  /* NEW: white layer behind the gradient card */
  background: #ffffff;
  display: flex;
  justify-content: center;
  padding: 32px 16px;
}

/* Wraps the gradient card (was .about-us before) */
.container {
  max-width: 980px;
  width: 100%;
  margin: 0 auto;
  background: linear-gradient(180deg, #f4faf8 0%, #e4f3ec 40%, #d7ecdf 100%);
  border-radius: 24px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.15);
  padding: 30px 24px 22px;
}

</style>
