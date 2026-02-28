package com.blog.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.entity.Article;
import com.blog.entity.Category;
import com.blog.entity.User;
import com.blog.mapper.ArticleMapper;
import com.blog.mapper.CategoryMapper;
import com.blog.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ArticleService {

    private final ArticleMapper articleMapper;
    private final CategoryMapper categoryMapper;
    private final UserMapper userMapper;

    public Page<Article> getArticles(int page, int size, Long categoryId) {
        LambdaQueryWrapper<Article> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Article::getStatus, "PUBLISHED");
        if (categoryId != null) {
            wrapper.eq(Article::getCategoryId, categoryId);
        }
        wrapper.orderByDesc(Article::getCreatedAt);
        Page<Article> result = articleMapper.selectPage(new Page<>(page, size), wrapper);
        enrichArticles(result.getRecords());
        return result;
    }

    public Article getById(Long id) {
        Article article = articleMapper.selectById(id);
        if (article != null) {
            enrichArticles(List.of(article));
        }
        return article;
    }

    private void enrichArticles(List<Article> articles) {
        if (articles == null || articles.isEmpty()) return;

        Set<Long> categoryIds = articles.stream()
                .map(Article::getCategoryId).filter(id -> id != null).collect(Collectors.toSet());
        Set<Long> userIds = articles.stream()
                .map(Article::getUserId).filter(id -> id != null).collect(Collectors.toSet());

        Map<Long, String> categoryMap = categoryIds.isEmpty() ? Map.of() :
                categoryMapper.selectBatchIds(categoryIds).stream()
                        .collect(Collectors.toMap(Category::getId, Category::getName));
        Map<Long, String> userMap = userIds.isEmpty() ? Map.of() :
                userMapper.selectBatchIds(userIds).stream()
                        .collect(Collectors.toMap(User::getId, User::getUsername));

        articles.forEach(a -> {
            if (a.getCategoryId() != null) a.setCategoryName(categoryMap.get(a.getCategoryId()));
            if (a.getUserId() != null) a.setAuthorName(userMap.get(a.getUserId()));
        });
    }

    public void incrementViewCount(Long id) {
        Article article = articleMapper.selectById(id);
        if (article != null) {
            article.setViewCount(article.getViewCount() + 1);
            articleMapper.updateById(article);
        }
    }

    public void save(Article article) {
        articleMapper.insert(article);
    }

    public void update(Article article) {
        articleMapper.updateById(article);
    }

    public void delete(Long id) {
        articleMapper.deleteById(id);
    }
}
