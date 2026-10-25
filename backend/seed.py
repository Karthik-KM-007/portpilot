import os
import sys
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session

# Add current and ml dir to path
curr_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, curr_dir)
sys.path.insert(0, os.path.abspath(os.path.join(curr_dir, "..", "ml")))

from database import SessionLocal, engine, get_db_engine_type
import models
from auth import get_password_hash

def seed_db():
    print(f"Initializing database ({get_db_engine_type().upper()})...")
    models.Base.metadata.drop_all(bind=engine)
    models.Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    now = datetime.now(timezone.utc)

    try:
        # ----------------------------------------------------------------
        # 1. Users & Shipping Agents
        # ----------------------------------------------------------------
        print("Seeding authenticated users & profiles...")
        agent_user = models.User(
            name="Alexander Vance (Oceanic Lines)",
            email="agent@portpilot.ai",
            password_hash=get_password_hash("agent123"),
            role=models.RoleEnum.SHIPPING_AGENT,
            company_name="Oceanic Maritime Logistics B.V.",
            phone="+31 10 555 0192",
            port_name=None,
        )
        db.add(agent_user)
        db.flush()

        shipping_agent = models.ShippingAgent(
            user_id=agent_user.id,
            agency_name="Oceanic Maritime Logistics B.V.",
            license_number="NL-ROT-AGENT-8821",
            contact_person="Alexander Vance",
            phone="+31 10 555 0192",
            email="ops@oceaniclogistics.nl",
            headquarters_country="Netherlands"
        )
        db.add(shipping_agent)

        authority_user = models.User(
            name="Rotterdam Harbour Master Office",
            email="authority@portpilot.ai",
            password_hash=get_password_hash("admin123"),
            role=models.RoleEnum.PORT_AUTHORITY,
            company_name="Port of Rotterdam Authority",
            phone="+31 10 252 1000",
            port_name="Rotterdam",
        )
        db.add(authority_user)
        db.commit()

        # ----------------------------------------------------------------
        # 2. Port Physical Resources: Berths
        # ----------------------------------------------------------------
        print("Seeding quayside berths...")
        berths = [
            models.Berth(
                berth_code="B-01",
                name="Berth 01 (North Terminal)",
                port_name="Rotterdam",
                status=models.ResourceStatusEnum.AVAILABLE,
                depth_meters=16.5,
                length_meters=400.0,
                bollards=24,
                cranes_allocated=2,
                current_vessel_name=None
            ),
            models.Berth(
                berth_code="B-02",
                name="Berth 02 (Deepwater Quay)",
                port_name="Rotterdam",
                status=models.ResourceStatusEnum.INCOMING,
                depth_meters=15.0,
                length_meters=350.0,
                bollards=20,
                cranes_allocated=3,
                current_vessel_name="Evergreen Voyager (ETA 14:00 UTC)"
            ),
            models.Berth(
                berth_code="B-03",
                name="Berth 03 (Feeder Terminal)",
                port_name="Rotterdam",
                status=models.ResourceStatusEnum.AVAILABLE,
                depth_meters=14.5,
                length_meters=320.0,
                bollards=18,
                cranes_allocated=2,
                current_vessel_name=None
            ),
            models.Berth(
                berth_code="B-04",
                name="Berth 04 (ULCV Mega Pier)",
                port_name="Rotterdam",
                status=models.ResourceStatusEnum.OPTIMAL,
                depth_meters=18.0,
                length_meters=450.0,
                bollards=28,
                cranes_allocated=4,
                current_vessel_name=None
            ),
        ]
        db.add_all(berths)
        db.commit()

        # ----------------------------------------------------------------
        # 3. Port Physical Resources: STS Cranes
        # ----------------------------------------------------------------
        print("Seeding STS quay crane fleet...")
        cranes = [
            models.Crane(
                crane_code="QC-01",
                name="STS Super Post-Panamax 01",
                port_name="Rotterdam",
                crane_type="STS Super Post-Panamax",
                status=models.ResourceStatusEnum.AVAILABLE,
                moves_per_hour=32,
                max_reach_rows="24 rows",
                safe_working_load_tons="65 Ton",
                assigned_berth_code="B-01"
            ),
            models.Crane(
                crane_code="QC-02",
                name="STS Super Post-Panamax 02",
                port_name="Rotterdam",
                crane_type="STS Super Post-Panamax",
                status=models.ResourceStatusEnum.AVAILABLE,
                moves_per_hour=30,
                max_reach_rows="24 rows",
                safe_working_load_tons="65 Ton",
                assigned_berth_code="B-01"
            ),
            models.Crane(
                crane_code="QC-03",
                name="STS Dual-Trolley Mega 03",
                port_name="Rotterdam",
                crane_type="STS Dual-Trolley Mega",
                status=models.ResourceStatusEnum.OPTIMAL,
                moves_per_hour=36,
                max_reach_rows="26 rows",
                safe_working_load_tons="80 Ton",
                assigned_berth_code="B-02"
            ),
            models.Crane(
                crane_code="QC-04",
                name="STS Dual-Trolley Mega 04",
                port_name="Rotterdam",
                crane_type="STS Dual-Trolley Mega",
                status=models.ResourceStatusEnum.OPTIMAL,
                moves_per_hour=35,
                max_reach_rows="26 rows",
                safe_working_load_tons="80 Ton",
                assigned_berth_code="B-02"
            ),
            models.Crane(
                crane_code="QC-05",
                name="STS Feeder Gantry 05",
                port_name="Rotterdam",
                crane_type="STS Feeder Gantry",
                status=models.ResourceStatusEnum.AVAILABLE,
                moves_per_hour=26,
                max_reach_rows="18 rows",
                safe_working_load_tons="50 Ton",
                assigned_berth_code="B-03"
            ),
            models.Crane(
                crane_code="QC-06",
                name="STS Super Post-Panamax 06",
                port_name="Rotterdam",
                crane_type="STS Super Post-Panamax",
                status=models.ResourceStatusEnum.MAINTENANCE,
                moves_per_hour=0,
                max_reach_rows="24 rows",
                safe_working_load_tons="65 Ton",
                assigned_berth_code="B-04"
            ),
        ]
        db.add_all(cranes)
        db.commit()

        # ----------------------------------------------------------------
        # 4. Port Physical Resources: Yard Blocks
        # ----------------------------------------------------------------
        print("Seeding container yard blocks...")
        blocks = [
            models.YardBlock(block_code="BLK-A1", port_name="Rotterdam", cargo_type="Reefer Stacks", capacity_teu=1200, current_occupancy_teu=890, density_percent=74.2, status=models.ResourceStatusEnum.NORMAL),
            models.YardBlock(block_code="BLK-A2", port_name="Rotterdam", cargo_type="Dry Containers 40ft", capacity_teu=3500, current_occupancy_teu=2800, density_percent=80.0, status=models.ResourceStatusEnum.NORMAL),
            models.YardBlock(block_code="BLK-B1", port_name="Rotterdam", cargo_type="Dry Containers 20ft", capacity_teu=4200, current_occupancy_teu=3600, density_percent=85.7, status=models.ResourceStatusEnum.WARNING),
            models.YardBlock(block_code="BLK-B2", port_name="Rotterdam", cargo_type="Dangerous Cargo (IMO)", capacity_teu=800, current_occupancy_teu=420, density_percent=52.5, status=models.ResourceStatusEnum.OPTIMAL),
            models.YardBlock(block_code="BLK-C1", port_name="Rotterdam", cargo_type="Transshipment Buffer", capacity_teu=2500, current_occupancy_teu=1950, density_percent=78.0, status=models.ResourceStatusEnum.NORMAL),
            models.YardBlock(block_code="BLK-C2", port_name="Rotterdam", cargo_type="Empty Container Depot", capacity_teu=5000, current_occupancy_teu=3200, density_percent=64.0, status=models.ResourceStatusEnum.OPTIMAL),
        ]
        db.add_all(blocks)
        db.commit()

        # ----------------------------------------------------------------
        # 5. Vessels Registry
        # ----------------------------------------------------------------
        print("Seeding vessel registry...")
        vessels = [
            models.Vessel(
                vessel_name="MSC Oscar",
                imo_number="IMO9703291",
                call_sign="3ERA9",
                mmsi="355906000",
                vessel_type="Container Ship",
                flag="Panama",
                built_year=2015,
                deadweight_tonnage=197362,
                gross_tonnage=192237,
                vessel_length=395.4,
                vessel_draft=16.0,
                container_count=19224,
                status=models.VesselStatusEnum.INCOMING,
                origin="Singapore",
                destination="Rotterdam",
                eta=now + timedelta(hours=36),
                submitted_by=agent_user.id
            ),
            models.Vessel(
                vessel_name="CMA CGM Jacques Saadé",
                imo_number="IMO9839179",
                call_sign="9HA5129",
                mmsi="228386600",
                vessel_type="Container Ship",
                flag="France",
                built_year=2020,
                deadweight_tonnage=220000,
                gross_tonnage=236583,
                vessel_length=400.0,
                vessel_draft=16.0,
                container_count=23000,
                status=models.VesselStatusEnum.INCOMING,
                origin="Shanghai",
                destination="Rotterdam",
                eta=now + timedelta(hours=60),
                submitted_by=agent_user.id
            ),
            models.Vessel(
                vessel_name="Evergreen Voyager",
                imo_number="IMO9811001",
                call_sign="BK229",
                mmsi="563001000",
                vessel_type="Container Ship",
                flag="Taiwan",
                built_year=2018,
                deadweight_tonnage=145000,
                gross_tonnage=120000,
                vessel_length=350.0,
                vessel_draft=14.0,
                container_count=8500,
                status=models.VesselStatusEnum.INCOMING,
                origin="Shanghai",
                destination="Rotterdam",
                eta=now + timedelta(hours=14),
                submitted_by=agent_user.id
            )
        ]
        db.add_all(vessels)
        db.commit()

        # ----------------------------------------------------------------
        # 6. Vessel Arrival Reports & Predictions
        # ----------------------------------------------------------------
        print("Seeding vessel arrival reports & ML prediction logs...")
        reports = [
            models.VesselArrivalReport(
                report_number="PR-0001",
                sender_id=agent_user.id,
                receiver_port="Rotterdam",
                status=models.ReportStatusEnum.SENT,
                vessel_name="MSC Oscar",
                imo_number="IMO9703291",
                vessel_type="Ultra Large Container Vessel (ULCV)",
                vessel_length=395.4,
                vessel_draft=16.0,
                flag="Panama",
                origin_port="Singapore",
                destination_port="Rotterdam",
                eta=now + timedelta(hours=36),
                etd=now + timedelta(hours=72),
                total_containers=19224,
                import_containers=8450,
                export_containers=6100,
                reefer_containers=1800,
                hazardous_containers=120,
                cargo_description="Electronic appliances, automotive parts, chilled food products.",
                assigned_berth_code="B-04",
                predicted_wait_hours=5.4,
                congestion_level="MODERATE",
                confidence_score=94.8,
                sent_at=now - timedelta(hours=2),
            ),
            models.VesselArrivalReport(
                report_number="PR-0002",
                sender_id=agent_user.id,
                receiver_port="Rotterdam",
                status=models.ReportStatusEnum.ACCEPTED,
                vessel_name="CMA CGM Jacques Saadé",
                imo_number="IMO9839179",
                vessel_type="Ultra Large Container Vessel (ULCV)",
                vessel_length=400.0,
                vessel_draft=16.0,
                flag="France",
                origin_port="Shanghai",
                destination_port="Rotterdam",
                eta=now + timedelta(hours=60),
                etd=now + timedelta(hours=108),
                total_containers=23000,
                import_containers=11200,
                export_containers=7800,
                reefer_containers=2200,
                hazardous_containers=190,
                cargo_description="Heavy machinery, solar cells, consumer electronics.",
                assigned_berth_code="B-04",
                predicted_wait_hours=6.1,
                congestion_level="MODERATE",
                confidence_score=93.6,
                sent_at=now - timedelta(hours=12),
            ),
            models.VesselArrivalReport(
                report_number="PR-0003",
                sender_id=agent_user.id,
                receiver_port="Rotterdam",
                status=models.ReportStatusEnum.SENT,
                vessel_name="Evergreen Voyager",
                imo_number="IMO9811001",
                vessel_type="Container Ship",
                vessel_length=350.0,
                vessel_draft=14.0,
                flag="Taiwan",
                origin_port="Shanghai",
                destination_port="Rotterdam",
                eta=now + timedelta(hours=14),
                etd=now + timedelta(hours=48),
                total_containers=8500,
                import_containers=4200,
                export_containers=3100,
                reefer_containers=850,
                hazardous_containers=45,
                cargo_description="Textiles, dry general cargo, medical supplies.",
                assigned_berth_code="B-02",
                predicted_wait_hours=3.2,
                congestion_level="MODERATE",
                confidence_score=95.4,
                sent_at=now - timedelta(hours=1),
            )
        ]
        db.add_all(reports)
        db.flush()

        # Seed initial status history and ML prediction logs
        for rep in reports:
            hist = models.ReportStatusHistory(
                report_id=rep.id,
                previous_status=None,
                new_status=rep.status.value,
                changed_by_id=agent_user.id,
                notes=f"Initial submission by shipping agent ({rep.sender_user.name})"
            )
            db.add(hist)

            ml_log = models.MLPredictionLog(
                report_id=rep.id,
                vessel_name=rep.vessel_name,
                imo_number=rep.imo_number,
                vessel_type=rep.vessel_type,
                model_name="XGBoost Regressor",
                model_version="v1.2-xgb-production",
                predicted_waiting_time_hours=rep.predicted_wait_hours,
                confidence_score_percent=rep.confidence_score,
                congestion_level=rep.congestion_level,
                recommended_berth=f"Berth {rep.assigned_berth_code}",
                recommended_cranes=3 if "02" in rep.assigned_berth_code else 4,
                features_json='{"provenance": "SYNTHETIC_BENCHMARK_ROTTERDAM_QUEUE_V1"}'
            )
            db.add(ml_log)

        db.commit()
        print("\n[OK] PortPilot AI database seeding completed successfully.")
        print("  - Shipping Agent: agent@portpilot.ai    / agent123")
        print("  - Port Authority: authority@portpilot.ai / admin123")
        print("  - Quayside Berths: 4 seeded")
        print("  - STS Cranes: 6 seeded")
        print("  - Container Yard Blocks: 6 seeded")
        print("  - Vessel Arrival Reports: 3 seeded\n")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
