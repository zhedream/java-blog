package com.blog.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.entity.Comment;
import com.blog.mapper.CommentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentMapper commentMapper;

    public List<Comment> getByArticleId(Long articleId) {
        return commentMapper.selectList(
            new LambdaQueryWrapper<Comment>()
                .eq(Comment::getArticleId, articleId)
                .orderByDesc(Comment::getCreatedAt)
        );
    }

    public void save(Comment comment) {
        commentMapper.insert(comment);
    }
}
