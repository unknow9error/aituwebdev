'use strict';

// PLAIN JAVASCRIPT. Guest reviews on feedback.html, built from the reviews array.

const reviews = [
  { name: 'Aigerim', text: 'The atmosphere is quiet enough to study, and their Spanish latte is consistently great.', recommend: '', date: new Date(2026, 8, 14), source: '2GIS Astana' }
];

function recommendLabel(answer) {
  switch (answer) {
    case 'yes':
      return 'Would recommend';
    case 'no':
      return 'Not sure yet';
    default:
      return '';
  }
}

function createReviewCard(review) {
  const figure = createElement('figure', 'review-quote mb-4');
  const quote = createElement('blockquote', 'blockquote mb-3');
  quote.append(createElement('p', '', review.text));

  const caption = createElement('figcaption', 'source-note');
  const parts = [review.name, recommendLabel(review.recommend)].filter((part) => part !== '');
  caption.append(parts.join(' · ') + ' · ' + review.source + ', accessed ');
  const time = createElement('time', '', review.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }));
  time.dateTime = review.date.toISOString();
  caption.append(time, '.');

  figure.append(quote, caption);
  return figure;
}

// Count line above the reviews, e.g. "2 comments · 1 would recommend Golden Coffee".
function reviewsSummary(list) {
  const recommending = list.filter((review) => review.recommend === 'yes').length;
  const comments = list.length + (list.length === 1 ? ' comment' : ' comments');
  return recommending > 0 ? comments + ' · ' + recommending + ' would recommend Golden Coffee' : comments;
}

const reviewsCount = createElement('p', 'source-note');
const reviewsList = createElement('div', '');
document.querySelector('#reviews .review-quote').replaceWith(reviewsCount, reviewsList);

for (const review of reviews) {
  reviewsList.append(createReviewCard(review));
}
if (reviews.length === 0) {
  reviewsList.append(createElement('p', 'source-note', 'No guest comments yet.'));
}
reviewsCount.textContent = reviewsSummary(reviews);
