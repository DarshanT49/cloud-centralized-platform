package com.cloudBackend.account.repository;

import com.cloudBackend.account.entity.ConnectedAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConnectedAccountRepository extends JpaRepository<ConnectedAccount, Long> {

    List<ConnectedAccount> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<ConnectedAccount> findByIdAndUserId(Long id, Long userId);

    Optional<ConnectedAccount> findByUserIdAndAccountEmail(Long userId, String accountEmail);

    boolean existsByUserIdAndAccountEmail(Long userId, String accountEmail);

    void deleteByIdAndUserId(Long id, Long userId);
}
