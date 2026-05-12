from pydantic import BaseModel, EmailStr, Field, field_validator


class ContactRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    message: str = Field(min_length=10, max_length=2000)

    @field_validator("name", "email", "message", mode="before")
    @classmethod
    def strip_whitespace(cls, v: str) -> str:
        return v.strip()

    @field_validator("name")
    @classmethod
    def reject_line_breaks_in_name(cls, v: str) -> str:
        if "\r" in v or "\n" in v:
            raise ValueError("line breaks are not allowed in name")
        return v

    @field_validator("message")
    @classmethod
    def reject_carriage_return_in_message(cls, v: str) -> str:
        if "\r" in v:
            raise ValueError("carriage returns are not allowed")
        return v
