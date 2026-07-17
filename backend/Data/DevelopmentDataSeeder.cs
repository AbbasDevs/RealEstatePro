using RealEstatePro.Models;

namespace RealEstatePro.Data;

public static class DevelopmentDataSeeder
{
    private const int TargetDemoProperties = 180;
    private const int TargetDemoTenants = 140;
    private const int MinApplicationsPerProperty = 8;

    public static void SeedAnalyticsDemoData(PeopleDbContext peopleDb, PropertyDbContext propertyDb)
    {
        var targetManager = EnsureDemoManager(peopleDb);
        var tenantIds = EnsureTenantsForDemo(peopleDb, TargetDemoTenants);

        var existingDemoProperties = propertyDb.Properties
            .Where(p => p.Name.StartsWith("Demo Property "))
            .OrderBy(p => p.Name)
            .ToList();

        if (existingDemoProperties.Count > 0)
        {
            foreach (var property in existingDemoProperties)
                property.ManagerId = targetManager.Id;
        }

        var random = new Random(20260712);
        var cityState = new (string City, string State)[]
        {
            ("Austin", "TX"),
            ("Seattle", "WA"),
            ("Denver", "CO"),
            ("Boston", "MA"),
            ("Miami", "FL"),
            ("Chicago", "IL")
        };

        var createdProperties = new List<Property>();

        var existingCount = existingDemoProperties.Count;
        var requiredNew = Math.Max(0, TargetDemoProperties - existingCount);

        for (var i = 0; i < requiredNew; i += 1)
        {
            var datasetIndex = existingCount + i;
            var locationMeta = cityState[datasetIndex % cityState.Length];

            var location = new Location
            {
                Address = $"{100 + datasetIndex} Demo St",
                City = locationMeta.City,
                State = locationMeta.State,
                Country = "USA",
                PostalCode = $"78{(100 + datasetIndex):D3}",
                Latitude = 30.0 + ((datasetIndex % 60) * 0.07),
                Longitude = -97.0 + ((datasetIndex % 60) * 0.05)
            };
            propertyDb.Locations.Add(location);

            var property = new Property
            {
                Name = $"Demo Property {datasetIndex + 1}",
                Description = "Seeded development listing for analytics and chart simulations.",
                ManagerId = targetManager.Id,
                Location = location,
                Amenities = new(),
                Highlights = new()
            };

            ApplyPropertyVariability(property, datasetIndex, cityState);

            propertyDb.Properties.Add(property);
            createdProperties.Add(property);
        }

        if (createdProperties.Count > 0 || existingDemoProperties.Count > 0)
            propertyDb.SaveChanges();

        var allDemoProperties = propertyDb.Properties
            .Where(p => p.Name.StartsWith("Demo Property "))
            .OrderBy(p => p.Id)
            .ToList();

        for (var i = 0; i < allDemoProperties.Count; i += 1)
        {
            allDemoProperties[i].ManagerId = targetManager.Id;
            ApplyPropertyVariability(allDemoProperties[i], i, cityState);
        }

        propertyDb.SaveChanges();

        var demoPropertyIds = allDemoProperties.Select(p => p.Id).ToList();
        var propertyById = allDemoProperties.ToDictionary(p => p.Id);

        var existingDemoApps = propertyDb.Applications
            .Where(a => demoPropertyIds.Contains(a.PropertyId))
            .OrderBy(a => a.Id)
            .ToList();

        for (var i = 0; i < existingDemoApps.Count; i += 1)
        {
            var application = existingDemoApps[i];
            if (!propertyById.TryGetValue(application.PropertyId, out var property))
                continue;

            ApplyApplicationVariability(application, property, i + application.Id * 17);
        }

        propertyDb.SaveChanges();

        var applications = new List<Application>();

        var existingAppCounts = existingDemoApps
            .GroupBy(a => a.PropertyId)
            .ToDictionary(g => g.Key, g => g.Count());

        for (var i = 0; i < allDemoProperties.Count; i += 1)
        {
            var property = allDemoProperties[i];
            var currentCount = existingAppCounts.TryGetValue(property.Id, out var count) ? count : 0;
            var targetCount = MinApplicationsPerProperty + (i % 5) + (property.PropertyType is PropertyType.Apartment or PropertyType.Villa ? 3 : 0);
            var toCreate = Math.Max(0, targetCount - currentCount);

            for (var j = 0; j < toCreate; j += 1)
            {
                var tenantId = tenantIds[(i * 7 + j * 13) % tenantIds.Count];
                var app = new Application
                {
                    PropertyId = property.Id,
                    TenantId = tenantId,
                    Name = $"Demo Tenant {tenantId}",
                    Email = $"tenant{tenantId}@demo.local",
                    PhoneNumber = $"+1-555-01{tenantId:D2}",
                    Message = "Interested in this listing. Seeded for dashboard analytics."
                };

                ApplyApplicationVariability(app, property, property.Id * 1000 + currentCount + j);
                applications.Add(app);
            }
        }

        if (applications.Count > 0)
        {
            propertyDb.Applications.AddRange(applications);
            propertyDb.SaveChanges();
        }
    }

    private static Manager EnsureDemoManager(PeopleDbContext peopleDb)
    {
        const string managerEmail = "manager.demo@realestate.local";
        var managerUser = peopleDb.Users.FirstOrDefault(u => u.Email == managerEmail);
        if (managerUser is null)
        {
            managerUser = new AppUser
            {
                Email = managerEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("DemoManager123!"),
                Role = UserRole.Manager,
                OwnerRequestStatus = OwnerRequestStatus.Approved
            };
            peopleDb.Users.Add(managerUser);
            peopleDb.SaveChanges();
        }

        var managerProfile = peopleDb.Managers.FirstOrDefault(m => m.UserId == managerUser.Id.ToString());
        if (managerProfile is null)
        {
            managerProfile = new Manager
            {
                UserId = managerUser.Id.ToString(),
                Name = "Demo Manager",
                Email = managerEmail,
                PhoneNumber = "+1-555-0100"
            };
            peopleDb.Managers.Add(managerProfile);
            peopleDb.SaveChanges();
        }

        if (managerUser.Role != UserRole.Manager)
        {
            managerUser.Role = UserRole.Manager;
            managerUser.OwnerRequestStatus = OwnerRequestStatus.Approved;
            peopleDb.SaveChanges();
        }

        if (managerUser.ManagerId != managerProfile.Id.ToString())
        {
            managerUser.ManagerId = managerProfile.Id.ToString();
            peopleDb.SaveChanges();
        }

        return managerProfile;
    }

    private static List<int> EnsureTenantsForDemo(PeopleDbContext peopleDb, int minimumTenantCount)
    {
        var tenantIds = peopleDb.Tenants.OrderBy(t => t.Id).Select(t => t.Id).ToList();
        if (tenantIds.Count >= minimumTenantCount)
            return tenantIds;

        var needed = minimumTenantCount - tenantIds.Count;
        for (var i = 0; i < needed; i += 1)
        {
            var index = tenantIds.Count + i + 1;
            var email = $"tenant.demo{index}@realestate.local";

            var user = peopleDb.Users.FirstOrDefault(u => u.Email == email);
            if (user is null)
            {
                user = new AppUser
                {
                    Email = email,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("DemoTenant123!"),
                    Role = UserRole.Tenant,
                    OwnerRequestStatus = OwnerRequestStatus.None
                };
                peopleDb.Users.Add(user);
                peopleDb.SaveChanges();
            }

            var tenant = peopleDb.Tenants.FirstOrDefault(t => t.UserId == user.Id.ToString());
            if (tenant is null)
            {
                tenant = new Tenant
                {
                    UserId = user.Id.ToString(),
                    Name = $"Demo Tenant {index}",
                    Email = email,
                    PhoneNumber = $"+1-555-02{index:D2}"
                };
                peopleDb.Tenants.Add(tenant);
                peopleDb.SaveChanges();
            }

            if (user.TenantId != tenant.Id.ToString())
            {
                user.TenantId = tenant.Id.ToString();
                peopleDb.SaveChanges();
            }
        }

        return peopleDb.Tenants.OrderBy(t => t.Id).Select(t => t.Id).ToList();
    }

    private static void ApplyPropertyVariability(Property property, int index, (string City, string State)[] cityState)
    {
        var random = new Random(100_000 + index * 97);
        var propertyType = WeightedPropertyType(index, random);
        var postedDate = BuildSeasonalPostedDate(random);
        var cityIdx = (index + ((int)propertyType * 2) + random.Next(0, 3)) % cityState.Length;

        property.PropertyType = propertyType;
        property.PostedDate = postedDate;
        property.PricePerMonth = BuildRent(propertyType, index, random);
        property.SecurityDeposit = Math.Round(property.PricePerMonth * (decimal)(0.75 + random.NextDouble() * 0.75), 0);
        property.ApplicationFee = 30 + random.Next(0, 6) * 5;
        property.IsPetsAllowed = random.NextDouble() > 0.35;
        property.IsParkingIncluded = random.NextDouble() > 0.25;
        property.Beds = propertyType switch
        {
            PropertyType.Rooms => 1,
            PropertyType.Tinyhouse => 1,
            PropertyType.Apartment => random.Next(1, 4),
            PropertyType.Villa => random.Next(3, 6),
            PropertyType.Townhouse => random.Next(2, 5),
            PropertyType.Cottage => random.Next(2, 4),
            _ => random.Next(1, 4)
        };
        property.Baths = propertyType switch
        {
            PropertyType.Rooms => 1,
            PropertyType.Tinyhouse => 1,
            PropertyType.Apartment => Math.Round(1 + random.NextDouble() * 1.5, 1),
            PropertyType.Villa => Math.Round(2 + random.NextDouble() * 2.5, 1),
            PropertyType.Townhouse => Math.Round(1.5 + random.NextDouble() * 1.5, 1),
            PropertyType.Cottage => Math.Round(1.5 + random.NextDouble() * 1.2, 1),
            _ => Math.Round(1 + random.NextDouble() * 2, 1)
        };
        property.SquareFeet = propertyType switch
        {
            PropertyType.Rooms => random.Next(280, 520),
            PropertyType.Tinyhouse => random.Next(320, 680),
            PropertyType.Apartment => random.Next(620, 1450),
            PropertyType.Villa => random.Next(1700, 4200),
            PropertyType.Townhouse => random.Next(1200, 2600),
            PropertyType.Cottage => random.Next(900, 2100),
            _ => random.Next(600, 1800)
        };

        var amenities = new List<Amenity> { Amenity.HighSpeedInternet, Amenity.Refrigerator };
        if (property.PricePerMonth > 2500) amenities.Add(Amenity.Dishwasher);
        if (property.IsParkingIncluded) amenities.Add(Amenity.Parking);
        if (property.IsPetsAllowed) amenities.Add(Amenity.PetsAllowed);
        if (property.PropertyType is PropertyType.Villa or PropertyType.Townhouse) amenities.Add(Amenity.WasherDryer);
        if (random.NextDouble() > 0.6) amenities.Add(Amenity.Gym);
        if (random.NextDouble() > 0.75) amenities.Add(Amenity.Pool);
        property.Amenities = amenities.Distinct().ToList();

        var highlights = new List<Highlight> { Highlight.HighSpeedInternetAccess, Highlight.CloseToTransit };
        if (property.PricePerMonth > 3000) highlights.Add(Highlight.GreatView);
        if (random.NextDouble() > 0.45) highlights.Add(Highlight.RecentlyRenovated);
        if (random.NextDouble() > 0.55) highlights.Add(Highlight.QuietNeighborhood);
        property.Highlights = highlights.Distinct().ToList();

        if (property.Location is not null)
        {
            property.Location.City = cityState[cityIdx].City;
            property.Location.State = cityState[cityIdx].State;
            property.Location.Country = "USA";
            property.Location.PostalCode = $"78{(100 + index):D3}";
            property.Location.Address = $"{100 + index} Demo St";
            property.Location.Latitude = 30.0 + ((index % 60) * 0.07);
            property.Location.Longitude = -97.0 + ((index % 60) * 0.05);
        }
    }

    private static DateTime BuildSeasonalPostedDate(Random random)
    {
        var now = DateTime.UtcNow.Date;
        var bandRoll = random.NextDouble();
        var monthOffset = bandRoll switch
        {
            < 0.45 => random.Next(0, 6),
            < 0.80 => random.Next(6, 14),
            _ => random.Next(14, 24)
        };

        var posted = now.AddDays(-(monthOffset * 30 + random.Next(0, 28)));
        return posted;
    }

    private static PropertyType WeightedPropertyType(int index, Random random)
    {
        var roll = random.NextDouble();
        if (roll < 0.30) return PropertyType.Apartment;
        if (roll < 0.52) return PropertyType.Townhouse;
        if (roll < 0.66) return PropertyType.Rooms;
        if (roll < 0.79) return PropertyType.Cottage;
        if (roll < 0.92) return PropertyType.Villa;
        return PropertyType.Tinyhouse;
    }

    private static decimal BuildRent(PropertyType type, int index, Random random)
    {
        var baseRent = type switch
        {
            PropertyType.Rooms => 850m,
            PropertyType.Tinyhouse => 1100m,
            PropertyType.Apartment => 1750m,
            PropertyType.Villa => 3400m,
            PropertyType.Townhouse => 2400m,
            PropertyType.Cottage => 2050m,
            _ => 1800m
        };

        var trendLift = index * 4.5m;
        var noise = (decimal)(random.NextDouble() * 900 - 450);
        return Math.Max(700m, Math.Round(baseRent + trendLift + noise, 0));
    }

    private static void ApplyApplicationVariability(Application application, Property property, int seed)
    {
        var random = new Random(seed);
        var now = DateTime.UtcNow;
        var lifetimeDays = Math.Max(14, (int)(now - property.PostedDate).TotalDays);
        var daysAfterPosted = Math.Min(lifetimeDays, (int)(Math.Pow(random.NextDouble(), 0.65) * lifetimeDays));
        var submittedOn = property.PostedDate.Date.AddDays(daysAfterPosted);
        if (submittedOn > now)
            submittedOn = now.AddDays(-random.Next(0, 4));

        var approvedBase = property.PricePerMonth switch
        {
            > 4200m => 0.30,
            > 3200m => 0.42,
            > 2400m => 0.52,
            _ => 0.62
        };

        var month = submittedOn.Month;
        var seasonalAdjustment = month is >= 5 and <= 8 ? 0.06 : (month is 11 or 12 or 1 ? -0.05 : 0);
        var approvedThreshold = Math.Clamp(approvedBase + seasonalAdjustment, 0.18, 0.78);
        var deniedThreshold = Math.Clamp(approvedThreshold + 0.23, 0.35, 0.95);

        var roll = random.NextDouble();
        ApplicationStatus status;
        if (submittedOn > now.AddDays(-12))
            status = ApplicationStatus.Pending;
        else if (roll < approvedThreshold)
            status = ApplicationStatus.Approved;
        else if (roll < deniedThreshold)
            status = ApplicationStatus.Denied;
        else
            status = ApplicationStatus.Pending;

        DateTime? decisionDate = null;
        if (status is ApplicationStatus.Approved or ApplicationStatus.Denied)
        {
            var reviewDays = status == ApplicationStatus.Approved
                ? random.Next(2, 28)
                : random.Next(1, 18);
            decisionDate = submittedOn.AddDays(reviewDays);
            if (decisionDate > now)
                decisionDate = now.AddDays(-random.Next(0, 2));
        }

        application.ApplicationDate = submittedOn;
        application.Status = status;
        application.DecisionDate = decisionDate;
    }
}