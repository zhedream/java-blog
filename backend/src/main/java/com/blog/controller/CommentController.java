package com.blog.controller;

import com.blog.common.Result;
import com.blog.entity.Comment;
import com.blog.entity.User;
import com.blog.service.CommentService;
import com.blog.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;
    private final UserService userService;

    @GetMapping("/{articleId}")
    public Result<List<Comment>> getByArticleId(@PathVariable Long articleId) {
        return Result.success(commentService.getByArticleId(articleId));
    }

    @PostMapping
    public Result<?> create(@RequestBody Comment comment, Authentication auth) {
        String username = (String) auth.getPrincipal();
        User user = userService.findByUsername(username);
        comment.setUserId(user != null ? user.getId() : 0L);
        commentService.save(comment);
        return Result.success();
    }
}
