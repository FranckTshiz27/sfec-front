package com.rawsur.apiautomobile.tools;

import lombok.AllArgsConstructor;
import org.keycloak.KeycloakPrincipal;
import org.keycloak.KeycloakSecurityContext;
import org.keycloak.adapters.springsecurity.token.KeycloakAuthenticationToken;
import org.keycloak.representations.AccessToken;
import org.keycloak.representations.AccessToken.Access;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.rawsur.apiautomobile.models.automobile.Action;
import com.rawsur.apiautomobile.models.automobile.Permission;
import com.rawsur.apiautomobile.models.automobile.User;
import com.rawsur.apiautomobile.repositories.automobile.ActionRepo;
import com.rawsur.apiautomobile.repositories.automobile.PermissionRepo;
import com.rawsur.apiautomobile.repositories.automobile.UserRepo;
import com.rawsur.apiautomobile.services.UserService;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;

@Service

public class KeycloakTools {

    @Autowired
    UserRepo userRepo;
    @Autowired
    UserService userService;
    @Autowired
    HttpServletRequest request;

    @Autowired
    private PermissionRepo permissionRepo;
    @Autowired
    private ActionRepo actionRepo;

    // KeycloakTools(UserRepo userRepo) {
    // this.userRepo = userRepo;
    // }

    private KeycloakSecurityContext getSession() {
        KeycloakAuthenticationToken token = (KeycloakAuthenticationToken) this.request.getUserPrincipal();

        if (token.equals(null) || token == null) {
            throw new RuntimeException("Merci de vous reconnecter. Votre session a expiré ");
        }
        KeycloakPrincipal<?> principal = (KeycloakPrincipal<?>) token.getPrincipal();
        KeycloakSecurityContext session = principal.getKeycloakSecurityContext();
        return session;
    }

    public AccessToken getAccessToken() {
        KeycloakSecurityContext session = this.getSession();
        AccessToken accessToken = session.getToken();
        return accessToken;
    }

    public String getAccessTokenString() {
        KeycloakSecurityContext session = this.getSession();
        String token = session.getTokenString();
        return token;
    }

    public Set<String> getRolesCurrentUser() {
        AccessToken accessToken = this.getAccessToken();
        Map<String, Access> resourceAccess = accessToken.getResourceAccess();
        Access access = resourceAccess.get("transport-frontend");
        Set<String> roles = access.getRoles();
        return roles;
    }

    @Transactional(readOnly = true)
    public User getCurrentUser() {
        AccessToken accessToken = this.getAccessToken();
        String username = accessToken.getPreferredUsername();

        User user = this.findUserByKeycloakId(username);

        if (user == null) {
            user = new User();
            user.setUsername(username);
            user.setFname(accessToken.getGivenName());
            user.setLname(accessToken.getFamilyName());
            user = this.userService.create(user);
        }

        return user;

    }

    private User findUserByKeycloakId(String username) {
        return this.userRepo.findByUsername(username);
    }

    @Transactional
    public List<Action> getUnallocatedActions(User user) {
        List<Action> actions = new ArrayList<>();
        List<Action> actionsInDB = this.actionRepo.findAll();
        for (Action action : actionsInDB) {
            Permission permission = this.permissionRepo.findByUserAndAction(user, action);
            if (permission != null) {
                actions.add(action);
            }
        }
        return actions;
    }

    @Transactional
    public void assignActions(User user, List<Action> actions) {
        for (Action action : actions) {
            Permission permission = new Permission();
            permission.setUser(user);
            permission.setAction(action);
            permission.setStatus(false);
            // permission.setUsercreate(user);
            // permission.setUserupdate(user);
            this.permissionRepo.save(permission);
        }
    }

    public String getIpClient() {
        return this.request.getRemoteAddr();
    }
}