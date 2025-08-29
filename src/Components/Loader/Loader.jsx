import React, {useEffect} from 'react'
import './Loader.css'

const Loader = () => {
  useEffect(() => {
    const steps = document.querySelectorAll('.step');
    steps.forEach((step, i) => {
      step.style.animation = `climb 1.2s ${i * 0.15}s infinite`;
    });
  }, []);
  return (
    <div className="stairs-wrapper" style={{height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
      <div className="stairs-loader">
        <span className="step"></span>
        <span className="step"></span>
        <span className="step"></span>
        <span className="step"></span>
        <span className="step"></span>
      </div>
      <div className="stairs-label">Loading…</div>
    </div>
  )
}

export default Loader


