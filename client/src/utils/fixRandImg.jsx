
import { useState } from "react";

const [largeImgList, smallImgList] = ['large', 'small']
  .map(size => [
    'ade,chris,christian,daniel,elliot,helen,jenny,joe,justen,laura,matt,nan,steve,stevie,veronika',
    'elyse,kristy,lena,lindsay,mark,matthew,molly,patrick,rachel',
  ].map((s, i) => ({ ver: 'avatar' + (i ? i + 1 : ''), names: s.split(','), size, ext: i? 'png': 'jpg' }))
    .map(({ ver, names, size, ext }) => names.map(name => `https://semantic-ui.com/images/${ver}/${size}/${name}.${ext}`)).flat());

function useFixRandImg(large = false) {
  const [seed, setSeed] = useState(Math.random());
  let imgList = (large ? largeImgList : smallImgList);
  let randImgUrl = imgList[~~(imgList.length * seed)];
  return { randImgUrl, seed, setSeed };
}

export default useFixRandImg;
