import React from 'react';

const STATUS = {
  PENDING: 'PENDING',
  REJECTED: 'REJECTED',
  APPROVED: 'APPROVED',
};

export default ({ comments }) => (
  <ul>
    {comments && comments.map(({ id, content, status }) => {
      let text = '';
      const style = {};

      if (status === STATUS.PENDING) {
        text = 'Comment awaiting moderation';
        style.fontStyle = 'italic';
      }
      if (status === STATUS.REJECTED) {
        text = 'Your comment was forbidden';
        style.color = 'red';
      }

      return (
        <li key={id} style={style}>
          {text || content}
        </li>
      );
    })}
  </ul>
);
