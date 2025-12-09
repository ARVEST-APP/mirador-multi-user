// Dynamically import all images from the 'logos' folder (relative to the current file)
const images = import.meta.glob('./logos/*.{png,jpg,jpeg,svg}', { eager: true });

// Extract the image URLs
const imagePaths = Object.values(images).map((module) => (module as { default: string }).default);

export const LandingFooter = () => {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        background: 'rgba(255, 255, 255, 0.8)', // Semi-transparent white
        borderRadius: '15px', // Rounded capsule shape
        padding: '10px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        height: '70px', // Fixed height
      }}
    >
      {imagePaths.map((image, index) => (
        <img
          key={index}
          src={image}
          alt={`Logo ${index + 1}`}
          style={{
            height: '100%', // Fill the capsule height
            width: 'auto', // Maintain aspect ratio
          }}
        />
      ))}
    </div>
  );
};
