-- Insert sample rewards
insert into public.rewards (name, description, points_required, category, icon) values
  ('$5 Apple Gift Card', 'Redeem this $5 Apple Gift Card for apps, games, music, movies, and more on the App Store and iTunes.', 5000, 'gift_card', 'gift'),
  ('$5 Google Play Card', 'Use this $5 Google Play Card to purchase apps, games, movies, books, and more on the Google Play Store.', 5000, 'gift_card', 'gift'),
  ('$5 Amazon Gift Card', 'Get a $5 digital gift card to spend on your favorite tools or platforms.', 5000, 'gift_card', 'gift'),
  ('$10 Amazon Gift Card', 'Get a $10 digital gift card to spend on your favorite tools or platforms.', 10000, 'gift_card', 'gift'),
  ('$5 Bank Transfer', 'The $5 equivalent will be transferred to your bank account.', 5000, 'cash', 'banknote'),
  ('$5 PayPal International', 'Receive a $5 PayPal balance transfer directly to your PayPal account email.', 5000, 'cash', 'banknote'),
  ('$5 Virtual Visa Card', 'Use your $5 prepaid card to shop anywhere Visa is accepted online.', 5000, 'cash', 'credit-card'),
  ('Free Udemy Course', 'Coming Soon!', 0, 'course', 'book-open')
on conflict do nothing;
