package com.blog.service;

import com.blog.entity.Category;
import com.blog.mapper.CategoryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryMapper categoryMapper;

    public List<Category> list() {
        return categoryMapper.selectList(null);
    }

    public void save(Category category) {
        categoryMapper.insert(category);
    }
}
