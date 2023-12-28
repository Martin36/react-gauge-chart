import React from 'react'

function Icon({percent, height, width}) {
  return (
    <svg height={height} width={width} version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" space="preserve">
      <g transform={`rotate(${90 + (percent * 180)}, 256, 256)`}>
        <path style={{fill:"#DEDDE0"}} d="M256,0c-43.503,0-78.769,47.023-78.769,105.026v275.692L256,512l78.769-131.282V105.026 C334.769,47.023,299.503,0,256,0z"/>
        <path style={{ fill:"#CDCDD0"}} d="M256,0c-43.503,0-78.769,47.023-78.769,105.026v275.692L256,512C256,512,256,105.464,256,0z"/>
        <ellipse style={{fill:"#FFFFFF"}} cx="256" cy="105.026" rx="39.385" ry="65.641"/>
      </g>
    </svg>
  );
}

export default Icon


