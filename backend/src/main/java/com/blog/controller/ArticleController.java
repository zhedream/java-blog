package com.blog.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.common.Result;
import com.blog.dto.ArticleRequest;
import com.blog.entity.Article;
import com.blog.entity.User;
import com.blog.service.ArticleService;
import com.blog.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/articles")
@RequiredArgsConstructor
public class ArticleController {

    private final ArticleService articleService;
    private final UserService userService;

    @GetMapping
    public Result<Page<Article>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long categoryId) {
        return Result.success(articleService.getArticles(page, size, categoryId));
    }

    @GetMapping("/{id}")
    public Result<Article> detail(@PathVariable Long id) {
        articleService.incrementViewCount(id);
        return Result.success(articleService.getById(id));
    }

    @PostMapping
    public Result<?> create(@Valid @RequestBody ArticleRequest req, Authentication auth) {
        Article article = new Article();
        article.setTitle(req.getTitle());
        article.setContent(req.getContent());
        article.setSummary(req.getSummary());
        article.setCoverImage(req.getCoverImage());
        article.setCategoryId(req.getCategoryId());
        article.setStatus(req.getStatus() != null ? req.getStatus() : "PUBLISHED");
        article.setViewCount(0);
        article.setUserId(resolveUserId(auth));
        articleService.save(article);
        return Result.success();
    }

    @PutMapping("/{id}")
    public Result<?> update(@PathVariable Long id, @Valid @RequestBody ArticleRequest req) {
        Article article = articleService.getById(id);
        if (article == null) return Result.fail("文章不存在");
        article.setTitle(req.getTitle());
        article.setContent(req.getContent());
        article.setSummary(req.getSummary());
        article.setCoverImage(req.getCoverImage());
        article.setCategoryId(req.getCategoryId());
        if (req.getStatus() != null) article.setStatus(req.getStatus());
        articleService.update(article);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<?> delete(@PathVariable Long id) {
        articleService.delete(id);
        return Result.success();
    }

    private Long resolveUserId(Authentication auth) {
        String username = (String) auth.getPrincipal();
        User user = userService.findByUsername(username);
        return user != null ? user.getId() : 0L;
    }
}