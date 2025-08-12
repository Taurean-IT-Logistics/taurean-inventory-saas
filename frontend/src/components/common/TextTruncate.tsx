import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

interface TextTruncateProps {
  text: string;
  maxLength: number;
  url?: string;
}

const TextTruncate = ({ text, maxLength, url = '#!' }: TextTruncateProps) => {
  const isTruncated = useMemo(() => {
    return text.length > maxLength;
  }, [text, maxLength]);

  const displayText = isTruncated ? `${text.slice(0, maxLength)}...` : text;
  return (
    <>
      {displayText}
      {isTruncated && <Link to={url}>Read more</Link>}
    </>
  );
};

export default TextTruncate;
