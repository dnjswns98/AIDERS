package team1234.aiders.application.user.repository;

import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import team1234.aiders.application.user.dto.UserResponseDto;
import team1234.aiders.application.user.entity.QUser;
import team1234.aiders.application.user.entity.User;

import java.util.List;
import java.util.stream.Collectors;

import static team1234.aiders.application.user.entity.QUser.user;

@RequiredArgsConstructor
public class CustomUserRepositoryImpl implements CustomUserRepository{

    private final JPAQueryFactory queryFactory;

    @Override
    public Page<UserResponseDto> searchUsers(Pageable pageable, String search, String role) {

        List<User> users = queryFactory
                .selectFrom(user)
                .where(
                        user.isDeleted.eq(false),
                        roleEq(role, user),
                        userKeyContains(search, user)
                )
                .orderBy(user.id.desc())
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        List<UserResponseDto> dtoList = users.stream()
                .map(UserResponseDto::fromEntity)
                .collect(Collectors.toList());

        Long total = queryFactory
                .select(user.count())
                .from(user)
                .where(
                        user.isDeleted.eq(false),
                        roleEq(role, user),
                        userKeyContains(search, user)
                )
                .fetchOne();

        if (total == null) {
            total = 0L;
        }

        return new PageImpl<>(dtoList, pageable, total);
    }

    private BooleanExpression roleEq(String role, QUser user) {
        if (role == null || role.trim().isEmpty()) {
            return null;
        }
        return user.role.eq(role);
    }

    private BooleanExpression userKeyContains(String search, QUser user) {
        if (search == null || search.trim().isEmpty()) {
            return null;
        }
        return user.userKey.contains(search);
    }
}
