from django.test import TestCase

from accounts.models import User

from .models import Membership, Organization
from .services import Create_Org


class CreateOrgServiceTests(TestCase):
    def test_create_org_returns_created_organization_instance(self):
        user = User.objects.create_user(
            email="owner@example.com",
            username="owner",
            uid="firebase-owner-id",
            password="password",
        )

        organization = Create_Org(name="Example Org", user=user, type="team")

        self.assertIsInstance(organization, Organization)
        self.assertEqual(organization.name, "Example Org")
        self.assertEqual(organization.owner, user)
        self.assertTrue(
            Membership.objects.filter(
                organization=organization,
                user=user,
                role="owner",
            ).exists()
        )
