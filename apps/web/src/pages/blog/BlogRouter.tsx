import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { BlogLandingPage } from './BlogLandingPage';
import { BlogPostPage } from './BlogPostPage';

const BlogRouter = () => {
    return (
        <Routes>
            <Route path="/" element={<BlogLandingPage />} />
            <Route path="/:slug" element={<BlogPostPage />} />
        </Routes>
    );
};

export default BlogRouter;
