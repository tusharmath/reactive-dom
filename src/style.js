export const dotStyle = (row, col) => ({
  backgroundColor: 'rgb(97, 218, 251)',
  position: 'absolute',
  fontStyle: 'normal',
  fontVariant: 'normal',
  fontWeight: 'normal',
  fontStretch: 'normal',
  fontSize: '10px',
  lineHeight: '20px',
  fontFamily: 'sans-serif',
  textAlign: 'center',
  cursor: 'pointer',
  width: '20px',
  height: '20px',
  borderRadius: '16.25px',
  left: `${col * 20}px`,
  top: `${row * 20}px`,
  contain: 'strict'
})

export const containerStyle = () => ({
  position: 'absolute',
  transformOrigin: '0px 0px 0px',
  left: '0%',
  top: '0%',
  width: '10px',
  height: '10px',
  background: 'rgb(238, 238, 238)'
})
