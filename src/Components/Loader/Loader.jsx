
export default function Loader() {
  return (
    <div style={styles.container}>
      <div style={styles.dot}></div>
      <style>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#000',
  },
  dot: {
    width: '30px',
    height: '30px',
    backgroundColor: '#3b82f6',
    borderRadius: '50%',
    animation: 'pulse 1s ease-in-out infinite',
  },
};