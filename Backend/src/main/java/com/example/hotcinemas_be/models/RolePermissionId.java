package com.example.hotcinemas_be.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RolePermissionId implements Serializable {
    private Long role;
    private Long permission;
}

