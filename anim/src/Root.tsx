import React from 'react';import {Composition,AbsoluteFill,useCurrentFrame,interpolate} from 'remotion';
const T:React.FC=()=>{const f=useCurrentFrame();return <AbsoluteFill style={{background:'#1b1f4a',justifyContent:'center',alignItems:'center'}}><div style={{color:'white',fontSize:120,transform:`scale(${interpolate(f,[0,30],[0.5,1],{extrapolateRight:'clamp'})})`}}>Hola</div></AbsoluteFill>};
export const Root:React.FC=()=><Composition id="T" component={T} durationInFrames={30} fps={30} width={1080} height={1920}/>;
