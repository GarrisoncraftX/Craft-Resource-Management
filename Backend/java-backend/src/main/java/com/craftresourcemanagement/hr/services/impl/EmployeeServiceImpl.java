package com.craftresourcemanagement.hr.services.impl;

import com.craftresourcemanagement.hr.entities.User;
import com.craftresourcemanagement.hr.repositories.UserRepository;
import com.craftresourcemanagement.hr.services.EmployeeService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EmployeeServiceImpl implements EmployeeService {

    private final UserRepository userRepository;

    public EmployeeServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public User registerEmployee(User user) {
        return userRepository.save(user);
    }

    @Override
    public List<User> listAllEmployees() {
        return userRepository.findAll();
    }

    @Override
    public Optional<User> findByEmployeeNumber(String employeeNumber) {
        return userRepository.findByEmployeeNumber(employeeNumber);
    }

    @Override
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }
}
