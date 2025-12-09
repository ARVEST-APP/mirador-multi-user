export const MediaFooter = () => {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '10px',
        right: '100px',
        background: 'rgba(255, 255, 255, 0.6)', // Semi-transparent white
        borderRadius: '5px', // Rounded capsule shape
        padding: '3px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        height: '30px', // Fixed height
      }}
    >
      To upload video and audio, please use our {' '}
      <a
        href="https://peertube.arvest.app/"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: 'rgb(24, 117, 209)' }} // Corrected: Style as an object
      > Peertube </a> {' '}
      instance
    </div>
  );
};
