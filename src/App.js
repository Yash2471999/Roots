import React, { useState, useEffect } from 'react';
import './App.css';

const BUILD_NUMBER = process.env.REACT_APP_BUILD_NUMBER || 'LOCAL';
const BUILD_TIME = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

const stages = [
  { id: 1, name: 'Checkout', icon: '⬇', duration: '2s', desc: 'Cloning from GitHub main branch' },
  { id: 2, name: 'Install', icon: '📦', duration: '45s', desc: 'npm install — resolving dependencies' },
  { id: 3, name: 'Test', icon: '🧪', duration: '12s', desc: 'Running test suites with Jest' },
  { id: 4, name: 'Build', icon: '⚙', duration: '30s', desc: 'npm run build — optimizing for production' },
  { id: 5, name: 'Docker', icon: '🐳', duration: '18s', desc: 'Building container image with Nginx' },
  { id: 6, name: 'Deploy', icon: '🚀', duration: '5s', desc: 'Container running on port 3000' },
];

function useTypewriter(text, speed = 40) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);
  return displayed;
}

function PipelineStage({ stage, status, delay }) {
  const colors = {
    success: { border: '#4ade80', bg: '#052010', text: '#4ade80', label: 'SUCCESS' },
    running: { border: '#60a5fa', bg: '#020d1f', text: '#60a5fa', label: 'RUNNING' },
    pending: { border: '#333', bg: '#111', text: '#555', label: 'PENDING' },
  };
  const c = colors[status];

  return (
    <div className="stage-wrap" style={{ animationDelay: `${delay}ms` }}>
      <div className="stage-card" style={{ borderColor: c.border, background: c.bg }}>
        <div className="stage-icon" style={{ color: c.text }}>{stage.icon}</div>
        <div className="stage-name" style={{ color: c.text }}>{stage.name}</div>
        <div className="stage-duration" style={{ color: status === 'pending' ? '#444' : c.text }}>
          {status === 'running' ? <span className="blink">●</span> : status === 'success' ? '✓' : '○'} {stage.duration}
        </div>
        {status !== 'pending' && (
          <div className="stage-label" style={{ color: c.text, borderColor: c.border }}>{c.label}</div>
        )}
      </div>
      <div className="stage-desc">{stage.desc}</div>
    </div>
  );
}

function LogLine({ text, delay, type }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const color = type === 'success' ? '#4ade80' : type === 'error' ? '#f87171' : type === 'info' ? '#60a5fa' : '#888';
  return visible ? <div className="log-line" style={{ color }}>{text}</div> : null;
}

export default function App() {
  const [currentStage, setCurrentStage] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [tick, setTick] = useState(0);

  const headline = useTypewriter('Jenkins CI/CD Pipeline', 60);

  useEffect(() => {
    const t = setInterval(() => setTick(x => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const runPipeline = () => {
    if (running || done) return;
    setRunning(true);
    setCurrentStage(1);
    setShowLogs(true);

    stages.forEach((_, i) => {
      setTimeout(() => {
        setCurrentStage(i + 2);
        if (i === stages.length - 1) {
          setDone(true);
          setRunning(false);
        }
      }, (i + 1) * 1800);
    });
  };

  const reset = () => {
    setCurrentStage(0);
    setRunning(false);
    setDone(false);
    setShowLogs(false);
  };

  const getStatus = (stageId) => {
    if (stageId < currentStage) return 'success';
    if (stageId === currentStage) return 'running';
    return 'pending';
  };

  const logs = [
    { text: `[${BUILD_TIME}] Pipeline started — Build #${BUILD_NUMBER}`, type: 'info', delay: 200 },
    { text: '[Checkout] Cloning https://github.com/user/my-jenkins-app.git', type: 'normal', delay: 800 },
    { text: '[Checkout] Branch: refs/remotes/origin/main', type: 'normal', delay: 1200 },
    { text: '[Install] Running: npm install', type: 'normal', delay: 2000 },
    { text: '[Install] added 1423 packages in 44s', type: 'success', delay: 3600 },
    { text: '[Test] PASS src/App.test.js', type: 'success', delay: 5200 },
    { text: '[Test] Test Suites: 1 passed, 1 total', type: 'success', delay: 5600 },
    { text: '[Build] Creating optimized production build...', type: 'normal', delay: 7000 },
    { text: '[Build] Compiled successfully in 28.4s', type: 'success', delay: 9000 },
    { text: '[Docker] Building image my-react-app:' + BUILD_NUMBER, type: 'info', delay: 10800 },
    { text: '[Docker] Successfully built & tagged', type: 'success', delay: 12400 },
    { text: '[Deploy] Stopping old container...', type: 'normal', delay: 14000 },
    { text: '[Deploy] Container react-app started on port 3000', type: 'success', delay: 15600 },
    { text: '✓ Pipeline completed successfully!', type: 'success', delay: 16200 },
  ];

  return (
    <div className="app">
      <header className="header">
        <div className="header-top">
          <div className="logo">
            <span className="logo-bracket">[</span>
            <span className="logo-text">JENKINS</span>
            <span className="logo-bracket">]</span>
          </div>
          <div className="header-meta">
            <span className="meta-item">build #{BUILD_NUMBER}</span>
            <span className="meta-dot">·</span>
            <span className="meta-item">main</span>
            <span className="meta-dot">·</span>
            <span className={`status-dot ${done ? 'success' : running ? 'running' : 'idle'}`}></span>
            <span className="meta-item">{done ? 'SUCCESS' : running ? 'RUNNING' : 'IDLE'}</span>
          </div>
        </div>

        <h1 className="headline">{headline}<span className="cursor">_</span></h1>
        <p className="subline">GitHub → Jenkins → Docker → Deploy</p>

        <div className="uptime-bar">
          <span className="uptime-label">PIPELINE</span>
          <div className="uptime-track">
            <div className="uptime-fill" style={{ width: done ? '100%' : running ? `${(currentStage / stages.length) * 100}%` : '0%' }}></div>
          </div>
          <span className="uptime-pct">
            {done ? '100' : running ? Math.round((currentStage / stages.length) * 100) : '0'}%
          </span>
        </div>
      </header>

      <main className="main">
        <section className="pipeline-section">
          <div className="section-header">
            <span className="section-tag">// pipeline stages</span>
            <span className="section-time">tick: {tick}s</span>
          </div>
          <div className="stages-grid">
            {stages.map((stage, i) => (
              <PipelineStage
                key={stage.id}
                stage={stage}
                status={getStatus(stage.id)}
                delay={i * 100}
              />
            ))}
          </div>
        </section>

        <div className="controls">
          <button
            className={`run-btn ${running ? 'running' : done ? 'done' : ''}`}
            onClick={runPipeline}
            disabled={running || done}
          >
            {running ? '⟳  PIPELINE RUNNING...' : done ? '✓  BUILD SUCCESSFUL' : '▶  RUN PIPELINE'}
          </button>
          {(done || currentStage > 0) && (
            <button className="reset-btn" onClick={reset}>↺ RESET</button>
          )}
        </div>

        {showLogs && (
          <section className="logs-section">
            <div className="section-header">
              <span className="section-tag">// console output</span>
              {done && <span className="success-tag">BUILD SUCCESS</span>}
            </div>
            <div className="log-terminal">
              <div className="terminal-bar">
                <span className="t-dot red"></span>
                <span className="t-dot yellow"></span>
                <span className="t-dot green"></span>
                <span className="t-title">jenkins-console — build #{BUILD_NUMBER}</span>
              </div>
              <div className="log-body">
                {logs.map((log, i) => (
                  <LogLine key={i} text={log.text} delay={log.delay} type={log.type} />
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="info-section">
          <div className="info-grid">
            <div className="info-card">
              <div className="info-label">// environment</div>
              <div className="info-row"><span>NODE</span><span className="accent">18.x LTS</span></div>
              <div className="info-row"><span>DOCKER</span><span className="accent">latest</span></div>
              <div className="info-row"><span>JENKINS</span><span className="accent">2.x LTS</span></div>
              <div className="info-row"><span>OS</span><span className="accent">Ubuntu 24.04</span></div>
            </div>
            <div className="info-card">
              <div className="info-label">// repository</div>
              <div className="info-row"><span>BRANCH</span><span className="accent2">main</span></div>
              <div className="info-row"><span>TRIGGER</span><span className="accent2">git push</span></div>
              <div className="info-row"><span>WEBHOOK</span><span className="accent2">:8080/github-webhook/</span></div>
              <div className="info-row"><span>SCM</span><span className="accent2">GitHub</span></div>
            </div>
            <div className="info-card">
              <div className="info-label">// deployment</div>
              <div className="info-row"><span>PORT</span><span className="accent">3000</span></div>
              <div className="info-row"><span>IMAGE</span><span className="accent">my-react-app</span></div>
              <div className="info-row"><span>SERVER</span><span className="accent">EC2 (ap-south-1)</span></div>
              <div className="info-row"><span>BASE</span><span className="accent">nginx:alpine</span></div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <span>built with jenkins + github + docker</span>
        <span className="footer-dot">·</span>
        <span>deployed on aws ec2</span>
        <span className="footer-dot">·</span>
        <span className="accent">ap-south-1</span>
      </footer>
    </div>
  );
}
