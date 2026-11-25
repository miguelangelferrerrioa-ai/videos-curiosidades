import React from 'react';import {Composition} from 'remotion';
import {SinDormir} from './SinDormir';import D from './sin-dormir.json';
import {Bostezo} from './Bostezo';import B from './bostezo.json';
export const Root:React.FC=()=><>
<Composition id="SinDormir" component={SinDormir} durationInFrames={Math.ceil(D.total*30)} fps={30} width={1080} height={1920}/>
<Composition id="Bostezo" component={Bostezo} durationInFrames={Math.ceil(B.total*30)} fps={30} width={1080} height={1920}/>
</>;
