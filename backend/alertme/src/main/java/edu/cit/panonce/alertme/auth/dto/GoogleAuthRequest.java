package edu.cit.panonce.alertme.auth.dto;

public class GoogleAuthRequest {
    private String idToken;
    private String email;
    private String firstName;
    private String lastName;
    private String googleSubject;

    public GoogleAuthRequest() {}

    public GoogleAuthRequest(String idToken, String email, String firstName, String lastName, String googleSubject) {
        this.idToken = idToken;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.googleSubject = googleSubject;
    }

    public String getIdToken() {
        return idToken;
    }

    public void setIdToken(String idToken) {
        this.idToken = idToken;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getGoogleSubject() {
        return googleSubject;
    }

    public void setGoogleSubject(String googleSubject) {
        this.googleSubject = googleSubject;
    }
}
