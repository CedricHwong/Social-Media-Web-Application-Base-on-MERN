
import React from 'react';
import { Popup } from 'semantic-ui-react';

function MyPopup({ content, children }) {
  return <Popup inverted content={content} trigger={children} position="top center" />;
}

export default MyPopup;
