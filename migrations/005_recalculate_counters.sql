-- Recalculate likes_count based on actual likes in community_likes table
UPDATE community_posts
SET likes_count = (
  SELECT COUNT(*) FROM community_likes WHERE community_likes.post_id = community_posts.id
);

-- Recalculate comments_count based on actual comments in community_comments table
UPDATE community_posts
SET comments_count = (
  SELECT COUNT(*) FROM community_comments WHERE community_comments.post_id = community_posts.id
);
