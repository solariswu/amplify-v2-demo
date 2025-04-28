export const configs = [
    {
        "auth": {
            "aws_region": "us-east-1",
            "user_pool_id": "us-east-1_B78sn82ah",
            "user_pool_client_id": "krmehdlntr625ora35j82pnit",
            "oauth": {
                "redirect_sign_in_uri": [
                    "https://multiuserpools.dhindu4ezjbex.amplifyapp.com"
                ],
                "redirect_sign_out_uri": [
                    "https://multiuserpools.dhindu4ezjbex.amplifyapp.com"
                ],
                "response_type": "code",
                "scopes": [
                    "phone",
                    "email",
                    "openid",
                    "profile",
                    "aws.cognito.signin.user.admin"
                ],
                "domain": "ygtest.auth.us-east-1.amazoncognito.com"
            },
        },
        "version": "1"
    },
    {
        "auth": {
            "aws_region": "us-east-1",
            "user_pool_id": "us-east-1_B78sn82ah",
            "user_pool_client_id": "3s83nf23q8fendqrguf7tb8sv",
            "oauth": {
                "redirect_sign_in_uri": [
                    "https://multiuserpools.dhindu4ezjbex.amplifyapp.com"
                ],
                "redirect_sign_out_uri": [
                    "https://multiuserpools.dhindu4ezjbex.amplifyapp.com"
                ],
                "response_type": "code",
                "scopes": [
                    "phone",
                    "email",
                    "openid",
                ],
                "domain": "ygtest.auth.us-east-1.amazoncognito.com"
            },
        },
        "version": "1"
    },
    {
        "auth": {
            "aws_region": "us-east-1",
            "user_pool_id": "us-east-1_WznKvalSA",
            "user_pool_client_id": "645las08c4r4lnbdl1s47n32qa",
            "oauth": {
                "redirect_sign_in_uri": [
                    "https://multiuserpools.dhindu4ezjbex.amplifyapp.com"
                ],
                "redirect_sign_out_uri": [
                    "https://multiuserpools.dhindu4ezjbex.amplifyapp.com"
                ],
                "response_type": "code",
                "scopes": [
                    "phone",
                    "email",
                    "openid",
                    "profile",
                ],
                "domain": "coglabtest.auth.us-east-1.amazoncognito.com"
            },
        },
        "version": "1"
    }
]