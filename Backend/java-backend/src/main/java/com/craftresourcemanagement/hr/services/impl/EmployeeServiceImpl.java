package com.craftresourcemanagement.hr.services.impl;

import com.craftresourcemanagement.hr.entities.User;
import com.craftresourcemanagement.hr.repositories.UserRepository;
import com.craftresourcemanagement.hr.services.EmployeeService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EmployeeServiceImpl implements EmployeeService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public EmployeeServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    @Override
    public User registerEmployee(User user) {
        if (user.getId() == null) {

            if (user.getPassword() == null || user.getPassword().isEmpty()) {
                user.setPassword(passwordEncoder.encode("Crafty!!"));
            } else {
                user.setPassword(passwordEncoder.encode(user.getPassword()));
            }
        } else {
            if (user.getPassword() == null || user.getPassword().isEmpty()) {
                Optional<User> existing = userRepository.findById(user.getId());
                if (existing.isPresent()) {
                    user.setPassword(existing.get().getPassword());
                }
            } else {
                user.setPassword(passwordEncoder.encode(user.getPassword()));
            }
        }
        return userRepository.save(user);
    }

    @Override
    public List<User> listAllEmployees() {
        return userRepository.findAll();
    }

    @Override
    public Optional<User> findByEmployeeId(String employeeId) {
        return userRepository.findByEmployeeId(employeeId);
    }

    @Override
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }
}
