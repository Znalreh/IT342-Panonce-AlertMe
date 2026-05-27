package com.example.alertme.config

object AppConfig {
    object API {
        const val AUTH_LOGIN = "api/v1/auth/login"
        const val AUTH_REGISTER = "api/v1/auth/register"
        const val AUTH_ME = "api/v1/auth/me"
    }

    object Alert {
        object Priorities {
            const val LOW = "LOW"
            const val MEDIUM = "MEDIUM"
            const val HIGH = "HIGH"
            val ALL = arrayOf(LOW, MEDIUM, HIGH)
        }

        object Categories {
            const val SECURITY = "SECURITY"
            const val INFRASTRUCTURE = "INFRASTRUCTURE"
            const val ENVIRONMENTAL = "ENVIRONMENTAL"
            const val OTHER = "OTHER"
        }

        object Status {
            const val OPEN = "OPEN"
            const val IN_PROGRESS = "IN_PROGRESS"
            const val RESOLVED = "RESOLVED"
        }
    }

    object HTTP {
        const val HEADER_ACCEPT = "Accept"
        const val HEADER_CONTENT_TYPE = "Content-Type"
        const val CONTENT_TYPE_JSON = "application/json"
        const val HEADER_AUTH = "Authorization"
    }
}
