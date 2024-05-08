import {makeProject} from '@motion-canvas/core';

import intro from './scenes/intro?scene';
import fundamentals0 from './scenes/fundamentals_0?scene';
import sinfunc from './scenes/sin?scene';
import fundamentals1 from './scenes/fundamentals_1?scene';
import maps_compare from './scenes/maps_compare0?scene';
import perlin_terrian from './scenes/perlin_terrain?scene';
import fractalnoise from './scenes/fractalnoise?scene';
import decoration from './scenes/decoration?scene';
import caves from './scenes/caves?scene';
import treescene from './scenes/treescene?scene';

import testscene from './scenes/test_scene?scene';

import {Code, LezerHighlighter} from '@motion-canvas/2d';
import {parser} from '@lezer/python';

Code.defaultHighlighter = new LezerHighlighter(parser);

import './global.css';

export default makeProject({
  scenes: [caves],
  experimentalFeatures : true,
});