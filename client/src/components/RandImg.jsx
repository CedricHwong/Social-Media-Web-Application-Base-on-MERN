
import React from 'react';
import { Image } from 'semantic-ui-react';
import useFixRandImg from '../utils/fixRandImg';

function RandImg({ large = false, ...props }) {
  let url = useFixRandImg(large).randImgUrl;
  return <Image src={url} {...props} />;
}

export default RandImg;
