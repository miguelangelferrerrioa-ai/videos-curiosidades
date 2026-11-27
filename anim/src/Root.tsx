import React from 'react';import {Composition} from 'remotion';
import {SinDormir} from './SinDormir';import D from './sin-dormir.json';
import {Bostezo} from './Bostezo';import {BostezoSVG} from './BostezoSVG';import {SolSVG} from './SolSVG';import {AguaSVG} from './AguaSVG';import {MosquitosSVG} from './MosquitosSVG';import MQ from './mosquitos.json';import AG from './agua.json';import SO from './sol.json';import B from './bostezo.json';
export const Root:React.FC=()=><>
<Composition id="SinDormir" component={SinDormir} durationInFrames={Math.ceil(D.total*30)} fps={30} width={1080} height={1920}/>
<Composition id="Bostezo" component={Bostezo} durationInFrames={Math.ceil(B.total*30)} fps={30} width={1080} height={1920}/>
<Composition id="BostezoSVG" component={BostezoSVG} durationInFrames={Math.ceil(B.total*30)} fps={30} width={1080} height={1920}/>
<Composition id="SolSVG" component={SolSVG} durationInFrames={Math.ceil(SO.total*30)} fps={30} width={1080} height={1920}/>
<Composition id="AguaSVG" component={AguaSVG} durationInFrames={Math.ceil(AG.total*30)} fps={30} width={1080} height={1920}/>
<Composition id="MosquitosSVG" component={MosquitosSVG} durationInFrames={Math.ceil(MQ.total*30)} fps={30} width={1080} height={1920}/>
</>;
