def test_join_waitlist(client):

    response = client.post(
        "/waitlist/add-in-location/1",
        json={
            "name": "Carla",
            "phone": "+51987654321",
            "party_size": 4,
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["name"] == "Carla"
    assert data["party_size"] == 4
    assert data["status"] == "WAITING"



def test_invalid_party_size(client):

    response = client.post(
        "/waitlist/add-in-location/1",
        json={
            "name": "Carla",
            "phone": "+51987654321",
            "party_size": 0,
        },
    )

    assert response.status_code == 422


def test_call_waitlist_entry(client):

    created = client.post(
        "/waitlist/add-in-location/1",
        json={
            "name": "Carla",
            "phone": "+51987654321",
            "party_size": 4,
        },
    )

    assert created.status_code == 201

    entry_id = created.json()["id"]

    response = client.patch(
        f"/waitlist/new-status/{entry_id}/call"
    )

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "CALLED"
    assert data["called_at"] is not None


def test_cannot_call_entry_twice(client):

    created = client.post(
        "/waitlist/add-in-location/1",
        json={
            "name": "Carla",
            "phone": "+51987654321",
            "party_size": 4,
        },
    )

    assert created.status_code == 201

    entry_id = created.json()["id"]

    first_response = client.patch(
        f"/waitlist/new-status/{entry_id}/call"
    )

    second_response = client.patch(
        f"/waitlist/new-status/{entry_id}/call"
    )

    assert first_response.status_code == 200
    assert second_response.status_code == 409