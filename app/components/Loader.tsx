

import React from "react";

export default function Loader() {
	return (
		   <div className="min-h-screen flex flex-col">
			   <div className="flex-1 flex items-center justify-center">
				<style>{`
					@keyframes rotate-cw {
						100% { transform: rotate(360deg); }
					}
					@keyframes rotate-ccw {
						100% { transform: rotate(-360deg); }
					}
				`}</style>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" width="120" height="120" style={{ shapeRendering: 'auto', display: 'block', background: 'var(--color-background)' }}>
					<g data-idx="1">
						<g style={{ transformOrigin: '50% 50%', animation: 'rotate-cw 0.8s linear infinite' }}>
							<circle strokeLinecap="round" fill="none" strokeDasharray="50.26548245743669 50.26548245743669" stroke="#d34e4e" strokeWidth="8" r="32" cy="50" cx="50" data-idx="2" transform="matrix(0.7705132597514167,0.6374239692286806,-0.6374239692286806,0.7705132597514167,43.345535473863194,-20.39686144900486)" />
						</g>
						<g style={{ transformOrigin: '50% 50%', animation: 'rotate-ccw 1.2s linear infinite' }}>
							<circle strokeLinecap="round" fill="none" strokeDashoffset="36.12831551628262" strokeDasharray="36.12831551628262 36.12831551628262" stroke="#d6a99d" strokeWidth="8" r="23" cy="50" cx="50" data-idx="4" transform="matrix(0.7705132597514167,-0.6374239692286806,0.6374239692286806,0.7705132597514167,-20.39686144900486,43.345535473863194)" />
						</g>
						<g data-idx="6"></g>
					</g>
				</svg>
			</div>
		</div>
	);
}
