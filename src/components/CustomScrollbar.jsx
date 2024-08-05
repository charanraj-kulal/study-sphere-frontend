import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';

const ScrollContainer = styled('div')(({ theme }) => ({
  height: '100%',
  overflow: 'auto',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: theme.palette.background.default,
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.grey[400],
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: theme.palette.grey[600],
  },
}));

const CustomScrollbar = ({ children, onScroll, ...props }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (onScroll) {
        onScroll({
          scrollTop: scrollRef.current.scrollTop,
          scrollHeight: scrollRef.current.scrollHeight,
          clientHeight: scrollRef.current.clientHeight,
        });
      }
    };

    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (scrollElement) {
        scrollElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [onScroll]);

  return (
    <ScrollContainer ref={scrollRef} {...props}>
      {children}
    </ScrollContainer>
  );
};

CustomScrollbar.propTypes = {
  children: PropTypes.node.isRequired,
  onScroll: PropTypes.func,
};

export default CustomScrollbar;