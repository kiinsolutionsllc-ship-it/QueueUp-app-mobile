import React, { createContext, useContext, useState, useEffect } from 'react';
// AsyncStorage removed - using Supabase only

const ReviewContext = createContext({});

export const useReview = () => {
  const context = useContext(ReviewContext);
  if (!context) {
    throw new Error('useReview must be used within a ReviewProvider');
  }
  return context;
};

export const ReviewProvider = ({ children }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      // Reviews are now managed in memory only
      setReviews([]);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const createReview = async (jobId, reviewerId, reviewerName, revieweeId, revieweeName, rating, comment, type) => {
    try {
      const newReview = {
        id: Date.now().toString(),
        jobId,
        reviewerId,
        reviewerName,
        revieweeId,
        revieweeName,
        rating: Math.max(1, Math.min(5, rating)), // Ensure rating is between 1-5
        comment,
        createdAt: new Date().toISOString(),
        type,
      };
      
      const updatedReviews = [...reviews, newReview];
      setReviews(updatedReviews);
      // Reviews are now managed in memory only
      
      return { success: true, review: newReview };
    } catch (error) {
      console.error('Error creating review:', error);
      return { success: false, error: error.message };
    }
  };

  const updateReview = async (reviewId, updates) => {
    try {
      const updatedReviews = reviews.map(review => 
        review.id === reviewId ? { ...review, ...updates } : review
      );
      setReviews(updatedReviews);
      // Reviews are now managed in memory only
      
      return { success: true };
    } catch (error) {
      console.error('Error updating review:', error);
      return { success: false, error: error.message };
    }
  };

  const deleteReview = async (reviewId) => {
    try {
      const updatedReviews = reviews.filter(review => review.id !== reviewId);
      setReviews(updatedReviews);
      // Reviews are now managed in memory only
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting review:', error);
      return { success: false, error: error.message };
    }
  };

  const getReviewsByUser = (userId) => {
    return reviews.filter(review => review.revieweeId === userId);
  };

  const getReviewsByJob = (jobId) => {
    return reviews.filter(review => review.jobId === jobId);
  };

  const getAverageRating = (userId) => {
    const userReviews = getReviewsByUser(userId);
    if (userReviews.length === 0) return 0;
    
    const totalRating = userReviews.reduce((sum, review) => sum + review.rating, 0);
    return totalRating / userReviews.length;
  };

  const getRatingDistribution = (userId) => {
    const userReviews = getReviewsByUser(userId);
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    userReviews.forEach(review => {
      distribution[review.rating]++;
    });
    
    return distribution;
  };

  const getTotalReviews = (userId) => {
    return getReviewsByUser(userId).length;
  };

  const hasUserReviewed = (jobId, reviewerId, type) => {
    return reviews.some(review => 
      review.jobId === jobId && 
      review.reviewerId === reviewerId && 
      review.type === type
    );
  };

  const getRecentReviews = (userId, limit = 5) => {
    return getReviewsByUser(userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  };

  const value = {
    reviews,
    loading,
    createReview,
    updateReview,
    deleteReview,
    getReviewsByUser,
    getReviewsByJob,
    getAverageRating,
    getRatingDistribution,
    getTotalReviews,
    hasUserReviewed,
    getRecentReviews,
  };

  return (
    <ReviewContext.Provider value={value}>
      {children}
    </ReviewContext.Provider>
  );
};
